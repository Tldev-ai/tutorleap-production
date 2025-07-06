import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

export class ClaudeQuestionGenerator {
  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is required');
    }
    
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  async generateQuestions({
    fromBoard,
    toBoard,
    grade,
    subject,
    topics,
    questionCount = 10,
    difficulty = 'medium'
  }) {
    const prompt = `
You are an expert educational content creator. You MUST generate EXACTLY ${questionCount} questions.

STRICT REQUIREMENTS:
- Generate EXACTLY ${questionCount} questions - no more, no less
- Each question must be complete with all required fields
- Return ONLY valid JSON array format
- Do not include any text before or after the JSON

Task: Create ${questionCount} educational questions for curriculum conversion.

Context:
- From Board: ${fromBoard}
- To Board: ${toBoard}
- Grade: ${grade}
- Subject: ${subject}
- Topics: ${topics.join(', ')}
- Difficulty: ${difficulty}

Question Distribution:
- ${Math.ceil(questionCount * 0.6)} Multiple Choice Questions
- ${Math.ceil(questionCount * 0.25)} Short Answer Questions  
- ${Math.floor(questionCount * 0.15)} Essay Questions

MANDATORY JSON FORMAT - Return exactly this structure with ${questionCount} questions:
[
  {
    "question": "Complete question text here",
    "type": "multiple_choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Detailed explanation of the correct answer",
    "difficulty": "${difficulty}",
    "topic": "specific topic from the list"
  }
]

For short_answer and essay type questions, omit the "options" field but keep all other fields.

IMPORTANT: Your response must be valid JSON starting with [ and ending with ]. Generate exactly ${questionCount} complete questions.
`;

    try {
      let attempts = 0;
      let questions = [];
      const maxAttempts = 3;

      while (attempts < maxAttempts && questions.length < questionCount) {
        attempts++;
        
        const response = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: Math.max(4000, questionCount * 200),
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        let content = response.content[0].text.trim();
        content = this.cleanJsonResponse(content);
        
        try {
          const parsedQuestions = JSON.parse(content);
          
          if (Array.isArray(parsedQuestions)) {
            questions = parsedQuestions;
            console.log(`Attempt ${attempts}: Generated ${questions.length} questions`);
            
            if (questions.length === questionCount) {
              break;
            } else if (questions.length < questionCount && attempts < maxAttempts) {
              const remaining = questionCount - questions.length;
              console.log(`Need ${remaining} more questions. Retrying...`);
              
              const additionalQuestions = await this.generateAdditionalQuestions({
                fromBoard, toBoard, grade, subject, topics, difficulty,
                questionCount: remaining,
                existingQuestions: questions
              });
              
              questions = [...questions, ...additionalQuestions];
            }
          }
        } catch (parseError) {
          console.error(`Parse error on attempt ${attempts}:`, parseError);
          if (attempts === maxAttempts) {
            throw new Error('Failed to parse questions after multiple attempts');
          }
        }
      }

      if (questions.length < questionCount) {
        console.warn(`Only generated ${questions.length} out of ${questionCount} questions`);
        questions = await this.ensureQuestionCount(questions, questionCount, {
          fromBoard, toBoard, grade, subject, topics, difficulty
        });
      }

      const validatedQuestions = questions.slice(0, questionCount).map((q, index) => ({
        id: uuidv4(),
        question: q.question || `Question ${index + 1}`,
        type: q.type || 'multiple_choice',
        options: q.options || undefined,
        correct_answer: q.correct_answer || '',
        explanation: q.explanation || '',
        difficulty: q.difficulty || difficulty,
        topic: q.topic || topics[0] || 'General'
      }));

      console.log(`Final result: ${validatedQuestions.length} questions generated`);
      return validatedQuestions;

    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  cleanJsonResponse(content) {
    const startIndex = content.indexOf('[');
    if (startIndex > 0) {
      content = content.substring(startIndex);
    }

    const endIndex = content.lastIndexOf(']');
    if (endIndex < content.length - 1) {
      content = content.substring(0, endIndex + 1);
    }

    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    return content.trim();
  }

  async generateAdditionalQuestions({
    fromBoard, toBoard, grade, subject, topics, difficulty, 
    questionCount, existingQuestions
  }) {
    const existingTopics = existingQuestions.map(q => q.topic).filter(Boolean);
    const unusedTopics = topics.filter(t => !existingTopics.includes(t));
    const focusTopics = unusedTopics.length > 0 ? unusedTopics : topics;

    const prompt = `
Generate EXACTLY ${questionCount} additional educational questions.

Requirements:
- Focus on these topics: ${focusTopics.join(', ')}
- Grade ${grade} ${subject} for ${toBoard} board
- Difficulty: ${difficulty}
- Avoid repeating these existing question patterns: ${existingQuestions.map(q => q.question.substring(0, 50)).join(', ')}

Return ONLY valid JSON array with exactly ${questionCount} questions:
[
  {
    "question": "question text",
    "type": "multiple_choice",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "explanation": "explanation",
    "difficulty": "${difficulty}",
    "topic": "topic name"
  }
]
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: questionCount * 200,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }]
      });

      let content = this.cleanJsonResponse(response.content[0].text);
      const additionalQuestions = JSON.parse(content);
      
      return Array.isArray(additionalQuestions) ? additionalQuestions : [];
    } catch (error) {
      console.error('Error generating additional questions:', error);
      return [];
    }
  }

  async ensureQuestionCount(existingQuestions, targetCount, params) {
    if (existingQuestions.length >= targetCount) {
      return existingQuestions.slice(0, targetCount);
    }

    const needed = targetCount - existingQuestions.length;
    console.log(`Generating ${needed} additional questions to reach target of ${targetCount}`);

    try {
      const additionalQuestions = await this.generateAdditionalQuestions({
        ...params,
        questionCount: needed,
        existingQuestions
      });

      const combinedQuestions = [...existingQuestions, ...additionalQuestions];
      return combinedQuestions.slice(0, targetCount);
    } catch (error) {
      console.error('Error ensuring question count:', error);
      return existingQuestions;
    }
  }

  async generatePuzzles({
    fromBoard,
    toBoard,
    grade,
    subject,
    topics,
    puzzleCount = 5,
    difficulty = 'medium'
  }) {
    const prompt = `
Generate EXACTLY ${puzzleCount} educational puzzles.

Context:
- Grade: ${grade}
- Subject: ${subject}
- Topics: ${topics.join(', ')}
- Difficulty: ${difficulty}
- Target Board: ${toBoard}

Return ONLY valid JSON array:
[
  {
    "title": "Puzzle title",
    "description": "Clear description of the puzzle",
    "hints": ["Hint 1", "Hint 2"],
    "solution": "Complete solution with explanation"
  }
]
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 3000,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }]
      });

      let content = this.cleanJsonResponse(response.content[0].text);
      const puzzles = JSON.parse(content);

      return puzzles.map(p => ({
        id: uuidv4(),
        ...p
      }));

    } catch (error) {
      console.error('Error generating puzzles:', error);
      throw new Error(`Failed to generate puzzles: ${error.message}`);
    }
  }

  async generateDetailedConcepts({
    fromBoard,
    toBoard,
    grade,
    subject,
    topics,
    difficulty = 'medium'
  }) {
    const prompt = `
Generate detailed concept explanations for the topics: ${topics.join(', ')}.

Context:
- Grade: ${grade}
- Subject: ${subject}
- Difficulty: ${difficulty}
- Target Board: ${toBoard}

Return ONLY valid JSON array:
[
  {
    "concept_name": "Concept name",
    "detailed_explanation": "Comprehensive explanation",
    "key_points": ["Point 1", "Point 2"],
    "examples": ["Example 1", "Example 2"]
  }
]
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      });

      let content = this.cleanJsonResponse(response.content[0].text);
      const concepts = JSON.parse(content);

      return concepts.map(c => ({
        id: uuidv4(),
        ...c
      }));

    } catch (error) {
      console.error('Error generating concepts:', error);
      throw new Error(`Failed to generate concepts: ${error.message}`);
    }
  }
}