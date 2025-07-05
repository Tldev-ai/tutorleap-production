// src/lib/claude.ts
// Claude API integration for TutorLeap curriculum conversion

export interface ConversionInput {
  fromBoard: string;
  toBoard: string;
  subject: string;
  grade: string;
  topic: string;
  content: string;
}

export interface BoardDifferences {
  teachingApproach: {
    currentMethod: string;
    newMethod: string;
    keyTransition: string;
  };
  assessmentStyle: {
    currentQuestions: string;
    newQuestions: string;
    markingDifference: string;
  };
  contentDepth: {
    conceptualFocus: string;
    practicalApplication: string;
    skillDevelopment: string;
  };
  commonMistakes: string[];
  actionableSteps: string[];
  incomeImpact: string;
  nextSteps: string;
}

export interface ConversionResult {
  success: boolean;
  boardDifferences: BoardDifferences;
  metadata: {
    fromBoard: string;
    toBoard: string;
    subject: string;
    grade: string;
    topic: string;
    convertedAt: string;
    conversionId: string;
  };
  error?: string;
}

export const convertWithClaude = async (input: ConversionInput): Promise<ConversionResult> => {
  try {
    // Check if API key exists
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    // Generate system prompt for conversion
    const systemPrompt = `You are TutorLeap's expert curriculum converter helping Indian teachers transition from ${input.fromBoard} to ${input.toBoard} to earn ₹1,500/hour instead of ₹300/hour.

TEACHER CONTEXT:
- Currently teaching ${input.fromBoard} ${input.subject} Grade ${input.grade}
- Wants to teach ${input.toBoard} to earn premium rates
- Needs practical, actionable differences for topic: ${input.topic}
- Content to convert: ${input.content}

RESPOND WITH VALID JSON ONLY:
{
  "success": true,
  "boardDifferences": {
    "teachingApproach": {
      "currentMethod": "Specific description of how ${input.fromBoard} teaches ${input.topic}",
      "newMethod": "Specific description of how ${input.toBoard} teaches ${input.topic}",
      "keyTransition": "The main mindset/approach change needed"
    },
    "assessmentStyle": {
      "currentQuestions": "Example of typical ${input.fromBoard} question format for ${input.topic}",
      "newQuestions": "Example of typical ${input.toBoard} question format for ${input.topic}",
      "markingDifference": "Key difference in marking/evaluation criteria"
    },
    "contentDepth": {
      "conceptualFocus": "What concepts to emphasize more/less compared to ${input.fromBoard}",
      "practicalApplication": "Real-world examples and contexts to use",
      "skillDevelopment": "What skills students should develop vs memorize"
    },
    "commonMistakes": [
      "Most common mistake ${input.fromBoard} teachers make when teaching ${input.toBoard}",
      "Second common error during transition",
      "Third mistake that reduces teaching effectiveness"
    ],
    "actionableSteps": [
      "Immediate change: What to do differently in next lesson",
      "Teaching strategy: How to restructure lesson approach",
      "Assessment approach: How to evaluate students differently"
    ],
    "incomeImpact": "Specific explanation of how mastering this difference enables ₹1,500/hour rates",
    "nextSteps": "What to practice or study next to master this transition"
  }
}

REQUIREMENTS:
- Be specific to ${input.subject} Grade ${input.grade} ${input.topic}
- Focus on practical teaching differences teachers can implement immediately
- Include real examples that work in Indian teaching context
- Explain clearly how this helps earn higher rates`;

    console.log(`🔄 Starting Claude API call for: ${input.fromBoard} → ${input.toBoard}`);

    // Make API call to Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Convert curriculum for teacher transition:

FROM: ${input.fromBoard} - ${input.subject} - ${input.grade}
TO: ${input.toBoard} - ${input.subject} - ${input.grade}
TOPIC: ${input.topic}
CONTENT: ${input.content}

Provide detailed board differences and practical teaching strategies that help teachers earn ₹1,500/hour.`
        }],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API Error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Claude API response received');

    // Parse Claude's JSON response
    let conversionData;
    try {
      conversionData = JSON.parse(result.content[0].text);
    } catch (parseError) {
      console.error('❌ Failed to parse Claude response as JSON:', parseError);
      throw new Error('Invalid JSON response from Claude API');
    }

    // Add metadata to the result
    const fullResult: ConversionResult = {
      ...conversionData,
      metadata: {
        fromBoard: input.fromBoard,
        toBoard: input.toBoard,
        subject: input.subject,
        grade: input.grade,
        topic: input.topic,
        convertedAt: new Date().toISOString(),
        conversionId: `tlc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };

    console.log(`✅ Conversion successful: ${fullResult.metadata.conversionId}`);
    return fullResult;

  } catch (error) {
    console.error('❌ Claude conversion error:', error);

    // Return fallback result with error information
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      boardDifferences: getFallbackDifferences(input),
      metadata: {
        fromBoard: input.fromBoard,
        toBoard: input.toBoard,
        subject: input.subject,
        grade: input.grade,
        topic: input.topic,
        convertedAt: new Date().toISOString(),
        conversionId: `tlc_fallback_${Date.now()}`
      }
    };
  }
};

// Fallback differences when Claude API fails
const getFallbackDifferences = (input: ConversionInput): BoardDifferences => {
  return {
    teachingApproach: {
      currentMethod: `${input.fromBoard} typically teaches ${input.topic} through definition-based learning and memorization of key concepts`,
      newMethod: `${input.toBoard} emphasizes application-based understanding and practical use of ${input.topic} concepts`,
      keyTransition: "Shift from 'what is it' to 'how do we use it in real-world situations'"
    },
    assessmentStyle: {
      currentQuestions: "Define, list, state, and recall-type questions focusing on memorization",
      newQuestions: "Analyze, interpret, evaluate, and apply-type questions focusing on understanding",
      markingDifference: "Marks awarded for reasoning process and methodology, not just final answers"
    },
    contentDepth: {
      conceptualFocus: "Less emphasis on memorization, more on understanding practical applications",
      practicalApplication: "Use international examples, real-world contexts, and case studies",
      skillDevelopment: "Focus on critical thinking, problem-solving, and analytical skills over recall"
    },
    commonMistakes: [
      "Teaching definitions and formulas without real-world context or application",
      "Focusing too much on memorization rather than conceptual understanding",
      "Using only Indian cultural examples instead of international, diverse contexts"
    ],
    actionableSteps: [
      "Start every lesson with a real-world problem or scenario related to the topic",
      "Replace 'what is' questions with 'how would you' and 'why do you think' questions",
      "Use case studies, international examples, and encourage student discussions"
    ],
    incomeImpact: `Mastering ${input.toBoard} teaching methodology for ${input.topic} makes you valuable to international students and families willing to pay ₹1,500/hour for quality, globally-recognized education`,
    nextSteps: `Practice creating application-based lesson plans for ${input.topic}, familiarize yourself with ${input.toBoard} assessment criteria, and study international teaching methodologies`
  };
};

// Helper function to validate conversion input
export const validateConversionInput = (input: ConversionInput): string[] => {
  const errors: string[] = [];
  
  if (!input.fromBoard?.trim()) errors.push('From Board is required');
  if (!input.toBoard?.trim()) errors.push('To Board is required');
  if (!input.subject?.trim()) errors.push('Subject is required');
  if (!input.grade?.trim()) errors.push('Grade is required');
  if (!input.topic?.trim()) errors.push('Topic is required');
  if (!input.content?.trim()) errors.push('Lesson Content is required');
  
  return errors;
};

// Helper function to create a sample conversion for testing
export const createSampleConversion = (): ConversionInput => ({
  fromBoard: 'CBSE',
  toBoard: 'IGCSE (Cambridge)',
  subject: 'Mathematics',
  grade: 'Grade 6',
  topic: 'statistics',
  content: 'qualitative and quantitative data types'
});