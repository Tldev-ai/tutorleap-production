// Enhanced version of your existing API route
// File: pages/api/generate-questions.js (or app/api/generate-questions/route.js)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, subject, grade, numQuestions, format, board, topic } = req.body;

  try {
    // Replace with your actual Claude API key
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    // Enhanced prompt for better question generation
    const enhancedPrompt = `Generate ${numQuestions} ${format} questions for ${board} Grade ${grade} ${subject} on the topic "${topic}".

Requirements:
- Board: ${board}
- Grade: ${grade} 
- Subject: ${subject}
- Topic: ${topic}
- Question Type: ${format}
- Number of Questions: ${numQuestions}

${format === 'MCQ' ? `
For MCQ questions:
- Provide exactly 4 options (A, B, C, D)
- Mark the correct answer clearly
- Make questions age-appropriate for Grade ${grade}
- Cover different difficulty levels within the topic
- Include brief explanations for answers
` : format === 'Mixed' ? `
For Mixed questions:
- Include MCQs, Short Answer, and Fill in the blanks
- Vary difficulty levels (easy, medium, hard)
- Make questions comprehensive
- Provide expected answers
` : `
For Extended questions:
- Include descriptive questions requiring detailed explanations
- Test deeper understanding of ${topic}
- Appropriate for ${board} curriculum
`}

Format the response as a valid JSON object with this exact structure:
{
"testInfo": {
  "title": "${board} Grade ${grade} ${subject} - ${topic} Test",
  "board": "${board}",
  "grade": "${grade}",
  "subject": "${subject}",
  "topic": "${topic}",
  "totalQuestions": ${numQuestions},
  "duration": "45 minutes",
  "maxMarks": ${numQuestions}
},
"questions": [
  {
    "id": 1,
    "question": "Question text here",
    "type": "${format}",
    ${format === 'MCQ' ? `
    "options": {
      "A": "Option A text",
      "B": "Option B text", 
      "C": "Option C text",
      "D": "Option D text"
    },
    "correctAnswer": "A",
    ` : `"expectedAnswer": "Expected answer or key points",`}
    "marks": 1,
    "difficulty": "easy",
    "explanation": "Brief explanation of the correct answer"
  }
]
}

IMPORTANT: 
- Ensure all questions are educationally sound and curriculum-appropriate
- Make questions specific to the topic "${topic}"
- Use difficulty levels: easy, medium, hard
- Provide clear, concise explanations
- Return ONLY valid JSON, no additional text`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;

    // Try to parse the JSON response from Claude
    let testData;
    try {
      // Extract JSON from the response (Claude might wrap it in markdown)
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        testData = JSON.parse(jsonMatch[0]);
      } else {
        testData = JSON.parse(generatedContent);
      }
      
      // Validate the structure
      if (!testData.testInfo || !testData.questions) {
        throw new Error('Invalid response structure');
      }
      
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      // Generate structured fallback with enhanced format
      testData = generateEnhancedFallback(subject, grade, numQuestions, format, board, topic);
    }

    // Ensure question IDs are sequential and format is correct
    testData.questions = testData.questions.map((q, index) => ({
      id: index + 1,
      question: q.question || `${subject} question ${index + 1} for Grade ${grade}`,
      type: format,
      options: format === 'MCQ' ? (q.options || {
        A: 'Option A',
        B: 'Option B', 
        C: 'Option C',
        D: 'Option D'
      }) : undefined,
      correctAnswer: format === 'MCQ' ? (q.correctAnswer || 'A') : undefined,
      expectedAnswer: format !== 'MCQ' ? (q.expectedAnswer || 'Sample answer') : undefined,
      marks: q.marks || 1,
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || 'Explanation not provided'
    }));

    res.status(200).json({
      success: true,
      testData: testData
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Return enhanced fallback questions if API fails
    const fallbackTestData = generateEnhancedFallback(subject, grade, numQuestions, format, board, topic);
    
    res.status(200).json({
      success: true,
      testData: fallbackTestData,
      fallback: true
    });
  }
}

// Enhanced fallback question generation with proper structure
function generateEnhancedFallback(subject, grade, numQuestions, format, board, topic) {
  const topics = getSubjectTopics(subject, grade);
  const selectedTopic = topic || topics[0];
  
  const testInfo = {
    title: `${board} Grade ${grade} ${subject} - ${selectedTopic} Test`,
    board: board,
    grade: grade,
    subject: subject,
    topic: selectedTopic,
    totalQuestions: parseInt(numQuestions),
    duration: "45 minutes",
    maxMarks: parseInt(numQuestions)
  };

  const questions = Array.from({ length: numQuestions }, (_, index) => {
    const questionTopic = topics[index % topics.length];
    const difficulties = ['easy', 'medium', 'hard'];
    const difficulty = difficulties[index % 3];
    
    if (format === 'MCQ') {
      return {
        id: index + 1,
        question: `What is the most important concept to understand about ${questionTopic} in ${subject} for Grade ${grade} students?`,
        type: 'MCQ',
        options: {
          A: `Basic understanding of ${questionTopic}`,
          B: `Advanced application of ${questionTopic}`,
          C: `Historical context of ${questionTopic}`,
          D: `Future implications of ${questionTopic}`
        },
        correctAnswer: 'A',
        marks: 1,
        difficulty: difficulty,
        explanation: `The basic understanding of ${questionTopic} is fundamental for Grade ${grade} students in ${subject}.`
      };
    } else if (format === 'Mixed') {
      const questionTypes = ['MCQ', 'Short Answer', 'Fill in the blank'];
      const questionType = questionTypes[index % 3];
      
      if (questionType === 'MCQ') {
        return {
          id: index + 1,
          question: `Which of the following best describes ${questionTopic}?`,
          type: 'MCQ',
          options: {
            A: `Primary aspect of ${questionTopic}`,
            B: `Secondary aspect of ${questionTopic}`,
            C: `Advanced concept in ${questionTopic}`,
            D: `Basic principle of ${questionTopic}`
          },
          correctAnswer: 'D',
          marks: 1,
          difficulty: difficulty,
          explanation: `Understanding basic principles is essential for ${questionTopic}.`
        };
      } else {
        return {
          id: index + 1,
          question: `Explain the significance of ${questionTopic} in ${subject}.`,
          type: 'Short Answer',
          expectedAnswer: `${questionTopic} is significant in ${subject} as it provides foundational knowledge essential for understanding core concepts at Grade ${grade} level.`,
          marks: 2,
          difficulty: difficulty,
          explanation: `This question tests understanding of how ${questionTopic} relates to broader ${subject} concepts.`
        };
      }
    } else {
      return {
        id: index + 1,
        question: `Analyze and explain in detail how ${questionTopic} impacts the overall understanding of ${subject} for Grade ${grade} students. Provide examples and discuss its practical applications.`,
        type: 'Extended',
        expectedAnswer: `${questionTopic} plays a crucial role in ${subject} education at Grade ${grade} level. Students should understand its theoretical foundations, practical applications, and connections to other concepts. Examples include... The practical applications involve... This knowledge helps students develop critical thinking skills and prepares them for advanced studies.`,
        marks: 5,
        difficulty: difficulty,
        explanation: `This extended question requires comprehensive understanding and analytical skills about ${questionTopic}.`
      };
    }
  });
  
  return {
    testInfo: testInfo,
    questions: questions
  };
}

// Enhanced subject topics with board-specific content
function getSubjectTopics(subject, grade) {
  const gradeNum = parseInt(grade);
  
  const topicsBySubject = {
    Mathematics: {
      '1-5': ['Number Recognition', 'Basic Arithmetic', 'Shapes and Patterns', 'Measurement', 'Time and Money', 'Simple Fractions', 'Data Handling', 'Problem Solving'],
      '6-8': ['Integers', 'Fractions and Decimals', 'Algebra Basics', 'Geometry', 'Ratio and Proportion', 'Percentage', 'Data Handling', 'Linear Equations'],
      '9-10': ['Number Systems', 'Polynomials', 'Linear Equations', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry', 'Statistics', 'Probability'],
      '11-12': ['Relations and Functions', 'Trigonometric Functions', 'Complex Numbers', 'Linear Inequalities', 'Conic Sections', 'Limits and Derivatives', 'Integrals', 'Differential Equations', 'Vectors', 'Three Dimensional Geometry']
    },
    Science: {
      '1-5': ['Living and Non-living', 'Plants Around Us', 'Animals Around Us', 'Human Body', 'Food and Health', 'Weather and Climate', 'Air and Water', 'Simple Machines'],
      '6-8': ['Food Components', 'Fibre to Fabric', 'Sorting Materials', 'Light Shadows and Reflections', 'Motion and Measurement', 'Living Organisms', 'Water', 'Forests Our Lifeline'],
      '9-10': ['Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms and Molecules', 'Structure of the Atom', 'Life Processes', 'Control and Coordination', 'How do Organisms Reproduce', 'Heredity and Evolution', 'Light Reflection and Refraction', 'Human Eye', 'Electricity', 'Magnetic Effects of Electric Current'],
      '11-12': ['Physical World', 'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work Energy and Power', 'Rotational Motion', 'Gravitation', 'Mechanical Properties of Solids', 'Thermal Properties of Matter', 'Kinetic Theory', 'Thermodynamics', 'Oscillations', 'Waves']
    },
    English: {
      '1-5': ['Letter Recognition', 'Phonics', 'Vocabulary Building', 'Simple Sentences', 'Story Reading', 'Basic Grammar', 'Creative Writing', 'Listening Skills'],
      '6-8': ['Reading Comprehension', 'Grammar Rules', 'Vocabulary Expansion', 'Essay Writing', 'Poetry Appreciation', 'Story Writing', 'Letter Writing', 'Speaking Skills'],
      '9-10': ['Literature Study', 'Prose Analysis', 'Poetry Analysis', 'Drama Study', 'Grammar and Usage', 'Composition Writing', 'Functional English', 'Communication Skills'],
      '11-12': ['Advanced Literature', 'Literary Criticism', 'World Literature', 'Language Study', 'Creative Writing', 'Research Skills', 'Communication Skills', 'Media Studies']
    },
    'हिंदी': {
      '1-5': ['वर्णमाला', 'मात्राएं', 'शब्द निर्माण', 'वाक्य रचना', 'कहानी पठन', 'कविता', 'लेखन अभ्यास', 'व्याकरण के मूल तत्व'],
      '6-8': ['गद्य पठन', 'काव्य पठन', 'व्याकरण', 'रचनात्मक लेखन', 'पत्र लेखन', 'निबंध लेखन', 'संवाद लेखन', 'भाषा कौशल'],
      '9-10': ['गद्य साहित्य', 'काव्य साहित्य', 'व्याकरण और रचना', 'भाषा अध्ययन', 'साहित्य का इतिहास', 'रचनात्मक लेखन', 'कार्यालयी हिंदी', 'संचार कौशल'],
      '11-12': ['उच्च साहित्य', 'साहित्यिक आलोचना', 'भाषा विज्ञान', 'छंदशास्त्र', 'अलंकारशास्त्र', 'रसशास्त्र', 'नाट्यशास्त्र', 'अनुवाद कला']
    },
    'Social Science': {
      '6-8': ['History - Our Past', 'Geography - Earth Our Habitat', 'Civics - Social and Political Life', 'Economics - Economic Life'],
      '9-10': ['History - India and Contemporary World', 'Geography - Contemporary India', 'Political Science - Democratic Politics', 'Economics - Understanding Economic Development'],
      '11-12': ['History - Themes in World History', 'Geography - Fundamentals of Human Geography', 'Political Science - Political Theory', 'Economics - Indian Economic Development']
    },
    Physics: {
      '11-12': ['Physical World', 'Units and Measurements', 'Motion in Straight Line', 'Motion in Plane', 'Laws of Motion', 'Work Energy Power', 'System of Particles', 'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves', 'Electric Charges', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics', 'Wave Optics', 'Dual Nature of Radiation', 'Atoms', 'Nuclei', 'Semiconductor Electronics', 'Communication Systems']
    },
    Chemistry: {
      '11-12': ['Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Hydrogen', 's-Block Elements', 'p-Block Elements', 'Organic Chemistry Principles', 'Hydrocarbons', 'Environmental Chemistry', 'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'General Principles', 'd and f Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols Phenols Ethers', 'Aldehydes Ketones', 'Carboxylic Acids', 'Organic Compounds with Nitrogen', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life']
    },
    Biology: {
      '11-12': ['Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 'Cell Unit of Life', 'Biomolecules', 'Cell Cycle and Division', 'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis', 'Respiration in Plants', 'Plant Growth and Development', 'Digestion and Absorption', 'Breathing and Gas Exchange', 'Body Fluids and Circulation', 'Excretory Products', 'Locomotion and Movement', 'Neural Control', 'Chemical Coordination', 'Reproduction in Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health and Disease', 'Microbes in Human Welfare', 'Biotechnology Principles', 'Biotechnology Applications', 'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues']
    }
  };

  let category = '';
  if (gradeNum >= 1 && gradeNum <= 5) category = '1-5';
  else if (gradeNum >= 6 && gradeNum <= 8) category = '6-8';
  else if (gradeNum >= 9 && gradeNum <= 10) category = '9-10';
  else if (gradeNum >= 11 && gradeNum <= 12) category = '11-12';

  return topicsBySubject[subject]?.[category] || ['General Concepts', 'Basic Principles', 'Fundamental Topics', 'Core Concepts', 'Essential Knowledge'];
}

// Parse non-JSON responses from Claude (enhanced version)
function parseNonJSONResponse(content, subject, grade, numQuestions, format, board, topic) {
  const lines = content.split('\n').filter(line => line.trim());
  const questions = [];
  
  let currentQuestion = null;
  let questionCount = 0;
  
  for (const line of lines) {
    // Look for question patterns
    if (line.match(/^\d+\./) || line.toLowerCase().includes('question')) {
      if (currentQuestion && currentQuestion.question) {
        questions.push(currentQuestion);
      }
      
      currentQuestion = {
        id: questionCount + 1,
        question: line.replace(/^\d+\.\s*/, '').trim(),
        type: format,
        options: format === 'MCQ' ? {} : undefined,
        correctAnswer: format === 'MCQ' ? 'A' : undefined,
        expectedAnswer: format !== 'MCQ' ? '' : undefined,
        marks: 1,
        difficulty: 'medium',
        explanation: ''
      };
      questionCount++;
    }
    // Look for options (A, B, C, D)
    else if (format === 'MCQ' && currentQuestion && line.match(/^[A-D][)\.]/)) {
      const optionLetter = line.charAt(0);
      const optionText = line.replace(/^[A-D][)\.]\s*/, '').trim();
      currentQuestion.options[optionLetter] = optionText;
    }
    // Look for answers
    else if (line.toLowerCase().includes('answer') && currentQuestion) {
      const answerText = line.replace(/answer:?\s*/i, '').trim();
      if (format === 'MCQ') {
        currentQuestion.correctAnswer = answerText.charAt(0).toUpperCase();
      } else {
        currentQuestion.expectedAnswer = answerText;
      }
    }
    // Look for explanations
    else if (line.toLowerCase().includes('explanation') && currentQuestion) {
      currentQuestion.explanation = line.replace(/explanation:?\s*/i, '').trim();
    }
  }
  
  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }
  
  // Fill remaining questions if needed
  while (questions.length < numQuestions) {
    const additionalQuestion = generateEnhancedFallback(subject, grade, 1, format, board, topic);
    questions.push(additionalQuestion.questions[0]);
  }
  
  return {
    testInfo: {
      title: `${board} Grade ${grade} ${subject} - ${topic} Test`,
      board: board,
      grade: grade,
      subject: subject,
      topic: topic,
      totalQuestions: numQuestions,
      duration: "45 minutes",
      maxMarks: numQuestions
    },
    questions: questions.slice(0, numQuestions)
  };
}
