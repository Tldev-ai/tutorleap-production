// src/lib/claude.ts - Fixed version with all exports
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

// Enhanced detailed interfaces
export interface DetailedBoardDifferences extends BoardDifferences {
  teachingApproach: {
    currentMethod: string;
    newMethod: string;
    keyTransition: string;
    detailedComparison: {
      lessonStructure: string;
      teacherRole: string;
      studentRole: string;
      pacing: string;
    };
  };
  assessmentStyle: {
    currentQuestions: string;
    newQuestions: string;
    markingDifference: string;
    examFormat: {
      questionTypes: string[];
      timeAllocation: string;
      markingScheme: string;
      sampleQuestions: {
        currentBoard: string[];
        newBoard: string[];
      };
    };
  };
  contentDepth: {
    conceptualFocus: string;
    practicalApplication: string;
    skillDevelopment: string;
    curriculumMapping: {
      topicsToEmphasize: string[];
      topicsToDeemphasize: string[];
      newTopicsToAdd: string[];
    };
  };
  detailedExamples: {
    lessonPlanComparison: {
      currentBoardLesson: string;
      newBoardLesson: string;
    };
    realWorldApplications: string[];
    technologyIntegration: string;
  };
  examSystemDifferences: {
    assessmentFrequency: string;
    gradingCriteria: string;
    courseworkVsExams: string;
    practicalAssessments: string;
  };
  teachingResources: {
    recommendedTextbooks: string[];
    onlineResources: string[];
    teachingAids: string[];
  };
}

export interface DetailedConversionResult {
  success: boolean;
  boardDifferences: DetailedBoardDifferences;
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

// Basic conversion function (your current working one)
export const convertWithClaude = async (input: ConversionInput): Promise<ConversionResult> => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    const systemPrompt = `You are TutorLeap's expert curriculum converter helping Indian teachers transition from ${input.fromBoard} to ${input.toBoard} to earn ₹1,500/hour instead of ₹300/hour.

RESPOND WITH VALID JSON ONLY:
{
  "success": true,
  "boardDifferences": {
    "teachingApproach": {
      "currentMethod": "How ${input.fromBoard} teaches ${input.topic}",
      "newMethod": "How ${input.toBoard} teaches ${input.topic}",
      "keyTransition": "Main change needed"
    },
    "assessmentStyle": {
      "currentQuestions": "Typical ${input.fromBoard} questions",
      "newQuestions": "Typical ${input.toBoard} questions",
      "markingDifference": "Key marking difference"
    },
    "contentDepth": {
      "conceptualFocus": "What to emphasize more/less",
      "practicalApplication": "Real-world examples to use",
      "skillDevelopment": "Skills vs memorization focus"
    },
    "commonMistakes": [
      "Common mistake 1",
      "Common mistake 2", 
      "Common mistake 3"
    ],
    "actionableSteps": [
      "Immediate change to make",
      "Teaching strategy to adopt",
      "Assessment approach to use"
    ],
    "incomeImpact": "How this enables ₹1,500/hour rates",
    "nextSteps": "What to practice next"
  }
}`;

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
          content: `Convert: ${input.fromBoard} → ${input.toBoard}
Subject: ${input.subject} ${input.grade}
Topic: ${input.topic}
Content: ${input.content}`
        }],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.statusText}`);
    }

    const result = await response.json();
    const conversionData = JSON.parse(result.content[0].text);

    return {
      ...conversionData,
      metadata: {
        fromBoard: input.fromBoard,
        toBoard: input.toBoard,
        subject: input.subject,
        grade: input.grade,
        topic: input.topic,
        convertedAt: new Date().toISOString(),
        conversionId: `tlc_${Date.now()}`
      }
    };

  } catch (error) {
    console.error('Claude conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
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

// Enhanced detailed conversion function
export const convertWithDetailedClaude = async (input: ConversionInput): Promise<DetailedConversionResult> => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    const systemPrompt = `You are TutorLeap's expert curriculum consultant with 15+ years of experience helping Indian teachers transition from ${input.fromBoard} to ${input.toBoard}.

PROVIDE COMPREHENSIVE, DETAILED ANALYSIS IN JSON FORMAT:

{
  "success": true,
  "boardDifferences": {
    "teachingApproach": {
      "currentMethod": "Detailed description of how ${input.fromBoard} teaches ${input.topic}",
      "newMethod": "Detailed description of how ${input.toBoard} teaches ${input.topic}",
      "keyTransition": "The fundamental mindset shift required",
      "detailedComparison": {
        "lessonStructure": "How lesson flow differs - ${input.fromBoard} vs ${input.toBoard}",
        "teacherRole": "Teacher's role transformation",
        "studentRole": "Student's role change",
        "pacing": "Speed and depth differences"
      }
    },
    "assessmentStyle": {
      "currentQuestions": "Specific examples of ${input.fromBoard} questions",
      "newQuestions": "Specific examples of ${input.toBoard} questions",
      "markingDifference": "Detailed marking criteria differences",
      "examFormat": {
        "questionTypes": ["List of question types in ${input.toBoard}"],
        "timeAllocation": "Time distribution across question types",
        "markingScheme": "How marks are allocated",
        "sampleQuestions": {
          "currentBoard": ["3 specific ${input.fromBoard} questions"],
          "newBoard": ["3 specific ${input.toBoard} questions"]
        }
      }
    },
    "contentDepth": {
      "conceptualFocus": "What concepts to emphasize with examples",
      "practicalApplication": "Real-world applications to use",
      "skillDevelopment": "21st century skills to develop",
      "curriculumMapping": {
        "topicsToEmphasize": ["Topics to spend more time on"],
        "topicsToDeemphasize": ["Topics to cover lightly"],
        "newTopicsToAdd": ["Additional topics needed"]
      }
    },
    "detailedExamples": {
      "lessonPlanComparison": {
        "currentBoardLesson": "Complete ${input.fromBoard} lesson plan outline",
        "newBoardLesson": "Complete ${input.toBoard} lesson plan outline"
      },
      "realWorldApplications": ["5 real-world applications"],
      "technologyIntegration": "Specific technology tools to use"
    },
    "examSystemDifferences": {
      "assessmentFrequency": "How often students are assessed",
      "gradingCriteria": "Different grading standards",
      "courseworkVsExams": "Balance between coursework and exams",
      "practicalAssessments": "Hands-on assessment requirements"
    },
    "teachingResources": {
      "recommendedTextbooks": ["Best textbooks for ${input.toBoard}"],
      "onlineResources": ["Websites and digital tools"],
      "teachingAids": ["Physical and digital materials needed"]
    },
    "commonMistakes": [
      "Most critical mistake",
      "Second common error",
      "Third mistake",
      "Fourth mistake",
      "Fifth mistake"
    ],
    "actionableSteps": [
      "Week 1: Immediate changes",
      "Week 2-4: Teaching adjustments", 
      "Month 2: Assessment transformation",
      "Month 3: Resource acquisition",
      "Ongoing: Professional development"
    ],
    "incomeImpact": "Detailed explanation of earning potential",
    "nextSteps": "Comprehensive roadmap for mastery"
  }
}`;

    console.log(`🔄 Starting detailed Claude analysis for: ${input.fromBoard} → ${input.toBoard}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Provide comprehensive curriculum conversion analysis:

FROM: ${input.fromBoard} - ${input.subject} - ${input.grade}
TO: ${input.toBoard} - ${input.subject} - ${input.grade}
TOPIC: ${input.topic}
CONTENT: ${input.content}

Include detailed teaching methodologies, exact question examples, lesson plans, assessment criteria, resources, and implementation guide.`
        }],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.statusText}`);
    }

    const result = await response.json();
    const conversionData = JSON.parse(result.content[0].text);

    return {
      ...conversionData,
      metadata: {
        fromBoard: input.fromBoard,
        toBoard: input.toBoard,
        subject: input.subject,
        grade: input.grade,
        topic: input.topic,
        convertedAt: new Date().toISOString(),
        conversionId: `tlc_detailed_${Date.now()}`
      }
    };

  } catch (error) {
    console.error('Detailed Claude conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      boardDifferences: getDetailedFallbackDifferences(input),
      metadata: {
        fromBoard: input.fromBoard,
        toBoard: input.toBoard,
        subject: input.subject,
        grade: input.grade,
        topic: input.topic,
        convertedAt: new Date().toISOString(),
        conversionId: `tlc_detailed_fallback_${Date.now()}`
      }
    };
  }
};

// Validation function
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

// Fallback differences for basic conversion
const getFallbackDifferences = (input: ConversionInput): BoardDifferences => ({
  teachingApproach: {
    currentMethod: `${input.fromBoard} focuses on definitions and memorization for ${input.topic}`,
    newMethod: `${input.toBoard} emphasizes practical application and understanding of ${input.topic}`,
    keyTransition: "Shift from 'what is it' to 'how do we use it'"
  },
  assessmentStyle: {
    currentQuestions: "Define, list, state type questions",
    newQuestions: "Analyze, interpret, evaluate type questions",
    markingDifference: "Marks for reasoning process, not just answers"
  },
  contentDepth: {
    conceptualFocus: "Less memorization, more understanding",
    practicalApplication: "Use international examples and contexts",
    skillDevelopment: "Critical thinking over recall"
  },
  commonMistakes: [
    "Teaching definitions without context",
    "Focusing on memorization over understanding",
    "Using only Indian examples"
  ],
  actionableSteps: [
    "Start with real-world problems",
    "Ask 'how' instead of 'what' questions",
    "Use international case studies"
  ],
  incomeImpact: `${input.toBoard} approach makes you valuable to international students`,
  nextSteps: `Practice creating application-based lessons for ${input.topic}`
});

// Detailed fallback differences
const getDetailedFallbackDifferences = (input: ConversionInput): DetailedBoardDifferences => ({
  ...getFallbackDifferences(input),
  teachingApproach: {
    currentMethod: `${input.fromBoard} uses teacher-centered approach for ${input.topic}`,
    newMethod: `${input.toBoard} employs student-centered learning for ${input.topic}`,
    keyTransition: "Move from 'sage on stage' to 'guide on side'",
    detailedComparison: {
      lessonStructure: `${input.fromBoard}: Explanation → Examples → Practice. ${input.toBoard}: Hook → Inquiry → Investigation → Reflection`,
      teacherRole: `${input.fromBoard}: Information provider. ${input.toBoard}: Learning facilitator`,
      studentRole: `${input.fromBoard}: Passive recipients. ${input.toBoard}: Active investigators`,
      pacing: `${input.fromBoard}: Fixed pace. ${input.toBoard}: Flexible based on understanding`
    }
  },
  assessmentStyle: {
    currentQuestions: `${input.fromBoard} questions: "Define ${input.topic}", "List types of..."`,
    newQuestions: `${input.toBoard} questions: "Analyze this data...", "Evaluate effectiveness..."`,
    markingDifference: `${input.fromBoard}: Correct answers only. ${input.toBoard}: Process and reasoning`,
    examFormat: {
      questionTypes: ["Multiple choice with justification", "Extended response", "Data analysis", "Problem-solving"],
      timeAllocation: "30% recall, 70% application",
      markingScheme: "Process-focused: Method (40%), Accuracy (30%), Communication (30%)",
      sampleQuestions: {
        currentBoard: [`Define qualitative data`, `List examples of quantitative data`, `Calculate the mean`],
        newBoard: [`Design a data collection plan`, `Analyze survey results and justify conclusions`, `Evaluate data reliability`]
      }
    }
  },
  contentDepth: {
    conceptualFocus: "Understanding when and why to use different data types",
    practicalApplication: "Real data from students' lives and current events",
    skillDevelopment: "Critical thinking, data literacy, communication, collaboration",
    curriculumMapping: {
      topicsToEmphasize: ["Data collection methods", "Data interpretation", "Bias analysis"],
      topicsToDeemphasize: ["Formula memorization", "Repetitive calculations"],
      newTopicsToAdd: ["Data ethics", "Digital tools", "Collaborative analysis"]
    }
  },
  detailedExamples: {
    lessonPlanComparison: {
      currentBoardLesson: "Define terms (10min) → Examples (15min) → Notes (10min) → Practice (10min)",
      newBoardLesson: "Real data hook (5min) → Investigation (20min) → Discussion (10min) → Application (10min)"
    },
    realWorldApplications: [
      "School cafeteria menu planning using surveys",
      "Sports team performance analysis",
      "Environmental data collection",
      "Social media usage patterns",
      "Community health data"
    ],
    technologyIntegration: "Google Sheets, Survey tools, Graphing calculators, Online collaboration"
  },
  examSystemDifferences: {
    assessmentFrequency: `${input.fromBoard}: Tests every 2-3 weeks. ${input.toBoard}: Ongoing assessment`,
    gradingCriteria: `${input.fromBoard}: 80% exams. ${input.toBoard}: 60% coursework, 40% exams`,
    courseworkVsExams: `${input.toBoard} emphasizes portfolio and projects over single exams`,
    practicalAssessments: "Data collection projects, group work, presentations"
  },
  teachingResources: {
    recommendedTextbooks: [`Cambridge ${input.toBoard} textbook`, "Hodder Education series", "Oxford International"],
    onlineResources: ["Khan Academy", "Desmos Classroom", "Google for Education"],
    teachingAids: ["Graphing calculators", "Tablets for data collection", "Real datasets"]
  }
});