  
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TestResultPageProps {
  testConfig: any;
  onBack: () => void;
}

interface Question {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  type: 'mcq' | 'short' | 'long';
  subject?: string;
}

const TestResultPage: React.FC<TestResultPageProps> = ({ testConfig, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateUniqueTimestamp = () => {
    return Date.now() + Math.random() * 1000;
  };

  const generateMixedQuestions = (grade: string, numQuestions: number): Question[] => {
    const subject = testConfig.subject;
    const uniqueId = generateUniqueTimestamp();
    const mcqCount = 15;
    const shortAnswerCount = numQuestions - mcqCount;
    const allQuestions: Question[] = [];

    const mcqQuestions = generateFallbackQuestions(
      subject, 
      grade, 
      mcqCount, 
      'MCQ', 
      uniqueId
    );
    
    mcqQuestions.forEach(q => {
      q.type = 'mcq';
      q.subject = subject;
    });
    
    allQuestions.push(...mcqQuestions);

    if (shortAnswerCount > 0) {
      const shortQuestions = generateFallbackQuestions(
        subject, 
        grade, 
        shortAnswerCount, 
        'Short', 
        uniqueId + 1000
      );
      
      shortQuestions.forEach(q => {
        q.type = 'short';
        q.subject = subject;
        delete q.options;
      });
      
      allQuestions.push(...shortQuestions);
    }

    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    return shuffledQuestions.map((q, index) => ({
      ...q,
      id: index + 1
    }));
  };

  const generateQuestionsWithAI = async (subject: string, grade: string, numQuestions: number, format: string, paperType: string) => {
    try {
      if (format === 'Mixed') {
        return generateMixedQuestions(grade, numQuestions);
      }

      const uniqueId = generateUniqueTimestamp();
      
      try {
        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: subject,
            grade: grade,
            numQuestions: numQuestions,
            format: format,
            uniqueId: uniqueId
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.questions && Array.isArray(data.questions)) {
            return data.questions.map((q: any, index: number) => ({
              id: index + 1,
              question: q.question,
              options: q.options,
              answer: q.answer,
              type: q.type,
              subject: subject
            }));
          }
        }
      } catch (apiError) {
        console.log('API not available, using fallback generation');
      }

      return generateFallbackQuestions(subject, grade, numQuestions, format, uniqueId);

    } catch (error) {
      console.error('Error generating questions:', error);
      return generateFallbackQuestions(subject, grade, numQuestions, format, generateUniqueTimestamp());
    }
  };

  const generateFallbackQuestions = (subject: string, grade: string, numQuestions: number, format: string, uniqueId: number): Question[] => {
    const topics = getSubjectTopics(subject, grade);
    const questionVariations = getQuestionVariations();
    
    return Array.from({ length: numQuestions }, (_, index) => {
      const topic = topics[index % topics.length];
      const variation = questionVariations[Math.floor((uniqueId + index) % questionVariations.length)];
      const isShortAnswer = format === 'Mixed' ? Math.random() > 0.5 : format !== 'MCQ';
      
      if (isShortAnswer) {
        return {
          id: index + 1,
          question: `${variation.shortQuestion} ${topic} in ${subject} for Grade ${grade} students.`,
          answer: `${topic} is ${variation.shortAnswer} in ${subject} as it ${variation.explanation} essential for Grade ${grade} curriculum.`,
          type: 'short' as const,
          subject: subject
        };
      } else {
        return {
          id: index + 1,
          question: `${variation.mcqQuestion} ${topic} in ${subject} for Grade ${grade}?`,
          options: [
            `${variation.optionPrefix} understanding of ${topic}`,
            `${variation.optionPrefix} application of ${topic}`,
            `${variation.optionPrefix} context of ${topic}`,
            `${variation.optionPrefix} implications of ${topic}`
          ],
          answer: `${variation.optionPrefix} understanding of ${topic}`,
          type: 'mcq' as const,
          subject: subject
        };
      }
    });
  };

  const getQuestionVariations = () => {
    return [
      {
        shortQuestion: "Explain the significance of",
        mcqQuestion: "What is an important concept related to",
        shortAnswer: "significant",
        explanation: "provides foundational knowledge",
        optionPrefix: "Basic"
      },
      {
        shortQuestion: "Describe the importance of",
        mcqQuestion: "Which aspect is most crucial in",
        shortAnswer: "important",
        explanation: "forms the basis for understanding",
        optionPrefix: "Advanced"
      },
      {
        shortQuestion: "Analyze the role of",
        mcqQuestion: "What makes",
        shortAnswer: "essential",
        explanation: "serves as a cornerstone for",
        optionPrefix: "Practical"
      },
      {
        shortQuestion: "Discuss how",
        mcqQuestion: "In what way does",
        shortAnswer: "valuable",
        explanation: "contributes to comprehensive understanding of",
        optionPrefix: "Theoretical"
      },
      {
        shortQuestion: "Evaluate the impact of",
        mcqQuestion: "What is the primary benefit of studying",
        shortAnswer: "fundamental",
        explanation: "establishes core principles for",
        optionPrefix: "Applied"
      }
    ];
  };

  const getSubjectTopics = (subject: string, grade: string): string[] => {
    const gradeNum = parseInt(grade);
    
    const topicsBySubject: Record<string, Record<string, string[]>> = {
      Mathematics: {
        'low': ['Addition and Subtraction', 'Multiplication Tables', 'Basic Fractions', 'Geometric Shapes', 'Time and Calendar', 'Money and Counting', 'Simple Measurements', 'Number Patterns'],
        'mid': ['Algebraic Expressions', 'Coordinate Geometry', 'Ratios and Proportions', 'Percentage Calculations', 'Integer Operations', 'Linear Equations', 'Basic Statistics', 'Probability Concepts'],
        'high': ['Quadratic Functions', 'Trigonometric Ratios', 'Coordinate Systems', 'Differential Calculus', 'Statistical Analysis', 'Complex Numbers', 'Logarithmic Functions', 'Matrix Operations']
      },
      Science: {
        'low': ['Animal Classification', 'Plant Parts and Functions', 'Weather Patterns', 'Solar System Bodies', 'States of Matter', 'Simple Machines', 'Human Body Systems', 'Environmental Conservation'],
        'mid': ['Cell Structure and Function', 'Force and Motion', 'Chemical Reactions', 'Photosynthesis Process', 'Electrical Circuits', 'Sound Wave Properties', 'Digestive System', 'Ecosystem Balance'],
        'high': ['Atomic Theory', 'Genetic Inheritance', 'Chemical Bonding', 'Theory of Evolution', 'Electromagnetic Spectrum', 'Organic Compounds', 'Ecological Relationships', 'Molecular Biology']
      },
      English: {
        'low': ['Story Comprehension', 'Grammar Basics', 'Vocabulary Development', 'Creative Writing', 'Poetry Elements', 'Letter Formation', 'Sentence Structure', 'Reading Fluency'],
        'mid': ['Literary Devices', 'Essay Structure', 'Advanced Grammar', 'Narrative Techniques', 'Reading Strategies', 'Public Speaking', 'Drama Elements', 'Research Skills'],
        'high': ['Literary Analysis', 'Rhetorical Strategies', 'Advanced Composition', 'World Literature', 'Critical Thinking', 'Debate Techniques', 'Media Literacy', 'Academic Writing']
      },
      Arts: {
        'low': ['Color Theory Basics', 'Drawing Techniques', 'Art Materials', 'Famous Artists', 'Creative Expression', 'Pattern Making', 'Shape Recognition', 'Art Appreciation'],
        'mid': ['Art History Periods', 'Painting Methods', 'Sculpture Basics', 'Cultural Art Forms', 'Design Principles', 'Mixed Media', 'Art Criticism', 'Portfolio Development'],
        'high': ['Renaissance Masters', 'Modern Art Movements', 'Art Theory', 'Studio Practices', 'Contemporary Artists', 'Digital Art', 'Art Business', 'Exhibition Curation']
      },
      'Physical Education': {
        'low': ['Basic Exercises', 'Sports Safety', 'Health Habits', 'Team Cooperation', 'Physical Fitness', 'Game Rules', 'Nutrition Basics', 'Good Posture'],
        'mid': ['Athletic Training', 'Sports Techniques', 'First Aid Skills', 'Leadership Qualities', 'Physical Development', 'Health Education', 'Competitive Sports', 'Fair Play'],
        'high': ['Sports Psychology', 'Exercise Science', 'Sports Medicine', 'Training Methods', 'Performance Analysis', 'Sports Management', 'Biomechanics', 'Athletic Careers']
      }
    };

    let category = '';
    if (gradeNum >= 1 && gradeNum <= 5) category = 'low';
    else if (gradeNum >= 6 && gradeNum <= 8) category = 'mid';
    else if (gradeNum >= 9 && gradeNum <= 12) category = 'high';

    return topicsBySubject[subject]?.[category] || ['General Concepts', 'Basic Principles', 'Fundamental Topics'];
  };

  const exportQuestionsOnly = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-questions';
    tempDiv.innerHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #2d3748; margin-bottom: 10px;">Mock Test Questions - ${testConfig.subject}</h1>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; font-size: 14px; color: #4a5568;">
            <div style="padding: 8px; background: #f7fafc; border-radius: 8px;"><strong>Board:</strong> ${testConfig.board}</div>
            <div style="padding: 8px; background: #f7fafc; border-radius: 8px;"><strong>Grade:</strong> ${testConfig.grade}</div>
            <div style="padding: 8px; background: #f7fafc; border-radius: 8px;"><strong>Subject:</strong> ${testConfig.subject}</div>
          </div>
        </div>
        ${questions.map((question) => `
          <div style="margin-bottom: 30px; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 12px; border-radius: 8px; min-width: 40px; text-align: center;">Q${question.id}</div>
              <div style="font-size: 16px; font-weight: 500; color: #2d3748; flex: 1;">${question.question}</div>
            </div>
            ${question.options ? `
              <div style="margin-left: 55px;">
                ${question.options.map((option, index) => `
                  <div style="display: flex; gap: 10px; margin-bottom: 8px; padding: 8px;">
                    <span style="font-weight: 600; color: #667eea;">${String.fromCharCode(65 + index)})</span>
                    <span style="color: #4a5568;">${option}</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="margin-left: 55px; border: 1px solid #d1d5db; border-radius: 6px; padding: 15px; min-height: 60px; background: white;">
                <!-- Space for written answers -->
              </div>
            `}
          </div>
        `).join('')}
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #718096; font-size: 14px;">
          <p>Generated by TutorLeap - AI-Powered Education Platform</p>
          <p>Test ID: ${testConfig.timestamp} | Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    document.body.appendChild(tempDiv);
    
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    document.body.removeChild(tempDiv);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${testConfig.subject}_Grade${testConfig.grade}_Questions_Only.pdf`);
  };

  const exportAnswersOnly = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-answers';
    tempDiv.innerHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #2d3748; margin-bottom: 10px;">Answer Key - ${testConfig.subject}</h1>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; font-size: 14px; color: #4a5568;">
            <div style="padding: 8px; background: #f7fafc; border-radius: 8px;"><strong>Board:</strong> ${testConfig.board}</div>
            <div style="padding: 8px; background: #f7fafc; border-radius: 8px;"><strong>Grade:</strong> ${testConfig.grade}</div>
            <div style="padding: 8px; background: #f7fafc; border-radius: 8px;"><strong>Subject:</strong> ${testConfig.subject}</div>
          </div>
        </div>
        ${questions.map((question) => `
          <div style="margin-bottom: 20px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f0fff4;">
            <div style="display: flex; gap: 15px; margin-bottom: 10px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 10px; border-radius: 6px; min-width: 35px; text-align: center;">Q${question.id}</div>
              <div style="font-size: 14px; color: #2d3748; flex: 1;">${question.question}</div>
            </div>
            <div style="margin-left: 50px; padding: 10px; background: #e6fffa; border: 1px solid #9ae6b4; border-radius: 6px;">
              <div style="font-weight: 600; color: #22543d; margin-bottom: 5px; font-size: 14px;">Answer:</div>
              <div style="color: #2d3748; font-size: 14px;">${question.answer}</div>
            </div>
          </div>
        `).join('')}
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #718096; font-size: 14px;">
          <p>Generated by TutorLeap - AI-Powered Education Platform</p>
          <p>Test ID: ${testConfig.timestamp} | Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    document.body.appendChild(tempDiv);
    
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    document.body.removeChild(tempDiv);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${testConfig.subject}_Grade${testConfig.grade}_Answers_Only.pdf`);
  };

  const shareQuestions = () => {
    const questionsText = questions.map((q, index) => 
      `Q${index + 1}: ${q.question}\n${q.options ? q.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n') : '(Written Answer Required)'}\n`
    ).join('\n');

    const shareText = `TutorLeap Mock Test - ${testConfig.subject} (Grade ${testConfig.grade})\n\n${questionsText}\nGenerated by TutorLeap AI-Powered Education Platform`;
    
    if (navigator.share) {
      navigator.share({
        title: `${testConfig.subject} Mock Test Questions`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Questions copied to clipboard!');
    }
  };

  const shareAnswers = () => {
    const answersText = questions.map((q, index) => 
      `Q${index + 1}: ${q.question}\nAnswer: ${q.answer}\n`
    ).join('\n');

    const shareText = `TutorLeap Answer Key - ${testConfig.subject} (Grade ${testConfig.grade})\n\n${answersText}\nGenerated by TutorLeap AI-Powered Education Platform`;
    
    if (navigator.share) {
      navigator.share({
        title: `${testConfig.subject} Answer Key`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Answers copied to clipboard!');
    }
  };

  useEffect(() => {
    const generateQuestions = async () => {
      setIsGenerating(true);
      setError(null);
      
      try {
        const generatedQuestions = await generateQuestionsWithAI(
          testConfig.subject,
          testConfig.grade,
          testConfig.questions,
          testConfig.format,
          testConfig.paperType
        );
        
        setQuestions(generatedQuestions);
      } catch (err) {
        setError('Failed to generate questions. Please try again.');
        console.error('Question generation error:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateQuestions();
  }, [testConfig]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .test-result-page-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-size: 400% 400%;
        animation: gradientShift 8s ease infinite;
        padding: 20px;
        font-family: Inter, sans-serif;
      }

      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .test-result-page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 20px;
      }

      .test-result-page-actions {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .test-result-page-back-btn, .test-result-page-action-btn {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 12px 20px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .test-result-page-back-btn:hover, .test-result-page-action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .test-result-page-action-btn.save-questions {
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        border: none;
      }

      .test-result-page-action-btn.save-answers {
        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        border: none;
      }

      .test-result-page-action-btn.share-questions {
        background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
        border: none;
      }

      .test-result-page-action-btn.share-answers {
        background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
        border: none;
      }

      .test-result-page-loading {
        text-align: center;
        padding: 60px 20px;
        color: white;
      }

      .test-result-page-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .test-result-page-loading h2 {
        font-size: 24px;
        margin-bottom: 10px;
      }

      .test-result-page-loading p {
        font-size: 16px;
        opacity: 0.8;
      }

      .test-content {
        background: white;
        border-radius: 16px;
        padding: 40px;
        margin: 0 auto;
        max-width: 800px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        color: #333;
      }

      .test-header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e2e8f0;
      }

      .test-title {
        font-size: 28px;
        font-weight: 700;
        color: #2d3748;
        margin-bottom: 10px;
      }

      .test-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
        font-size: 14px;
        color: #4a5568;
      }

      .test-info-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        background: #f7fafc;
        border-radius: 8px;
      }

      .test-instructions {
        background: #e6fffa;
        border: 1px solid #81e6d9;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 30px;
      }

      .test-instructions h3 {
        font-size: 16px;
        font-weight: 600;
        color: #234e52;
        margin-bottom: 8px;
      }

      .test-instructions ul {
        list-style-type: disc;
        margin-left: 20px;
        color: #2d3748;
      }

      .test-instructions li {
        margin-bottom: 4px;
        font-size: 14px;
      }

      .question-container {
        margin-bottom: 30px;
        padding: 25px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
      }

      .question-header {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 15px;
      }

      .question-number {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-size: 14px;
        padding: 8px 12px;
        border-radius: 8px;
        min-width: 40px;
        text-align: center;
        flex-shrink: 0;
      }

      .question-text {
        font-size: 16px;
        font-weight: 500;
        color: #2d3748;
        line-height: 1.5;
        flex: 1;
      }

      .question-subject {
        background: #e6fffa;
        color: #234e52;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-left: auto;
      }

      .options-container {
        margin-left: 55px;
      }

      .option {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        transition: background-color 0.2s ease;
      }

      .option:hover {
        background: #edf2f7;
      }

      .option-label {
        font-weight: 600;
        color: #667eea;
        min-width: 20px;
      }

      .option-text {
        color: #4a5568;
        font-size: 15px;
      }

      .answer-section {
        margin-top: 20px;
        padding: 15px;
        background: #f0fff4;
        border: 1px solid #9ae6b4;
        border-radius: 8px;
        margin-left: 55px;
      }

      .answer-label {
        font-weight: 600;
        color: #22543d;
        margin-bottom: 5px;
        font-size: 14px;
      }

      .answer-text {
        color: #2d3748;
        font-size: 15px;
        font-weight: 500;
      }

      .short-answer-space {
        margin-left: 55px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 15px;
        min-height: 60px;
        background: white;
      }

      .test-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e2e8f0;
        text-align: center;
        color: #718096;
        font-size: 14px;
      }

      @media (max-width: 768px) {
        .test-result-page-header {
          flex-direction: column;
          align-items: stretch;
        }
        
        .test-result-page-actions {
          justify-content: center;
        }
        
        .test-content {
          padding: 20px;
          margin: 20px;
        }
        
        .test-title {
          font-size: 24px;
        }
        
        .question-container {
          padding: 15px;
        }
        
        .options-container {
          margin-left: 0;
          margin-top: 15px;
        }
        
        .answer-section {
          margin-left: 0;
        }
        
        .short-answer-space {
          margin-left: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (isGenerating) {
    return (
      <div className="test-result-page-container">
        <div className="test-result-page-loading">
          <div className="test-result-page-spinner"></div>
          <h2>Generating Unique Questions</h2>
          <p>Creating fresh {testConfig.subject} questions for Grade {testConfig.grade}...</p>
          <p style={{ fontSize: '14px', marginTop: '10px', opacity: '0.7' }}>
            {testConfig.format === 'Mixed' ? `Generating 15 MCQ + ${testConfig.questions - 15} short answer questions` : 'Using AI to generate unique content'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-result-page-container">
        <div className="test-result-page-loading">
          <h2>⚠️ Generation Failed</h2>
          <p>{error}</p>
          <button 
            style={{ 
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '15px'
            }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-result-page-container">
      <div className="test-result-page-header">
        <button className="test-result-page-back-btn" onClick={onBack}>
          ← Back to Mock Test
        </button>
        <div className="test-result-page-actions">
          <button className="test-result-page-action-btn save-questions" onClick={exportQuestionsOnly}>
            💾 Save Questions
          </button>
          <button className="test-result-page-action-btn save-answers" onClick={exportAnswersOnly}>
            📝 Save Answers
          </button>
          <button className="test-result-page-action-btn share-questions" onClick={shareQuestions}>
            📤 Share Questions
          </button>
          <button className="test-result-page-action-btn share-answers" onClick={shareAnswers}>
            🔗 Share Answers
          </button>
        </div>
      </div>

      <div id="test-content" className="test-content">
        <div className="test-header">
          <h1 className="test-title">
            {testConfig.format === 'Mixed' ? `Mixed Format Mock Test - ${testConfig.subject}` : `${testConfig.subject} Mock Test`}
          </h1>
          
          <div className="test-info">
            <div className="test-info-item">
              <span>Board:</span>
              <span>{testConfig.board}</span>
            </div>
            <div className="test-info-item">
              <span>Grade:</span>
              <span>{testConfig.grade}</span>
            </div>
            <div className="test-info-item">
              <span>Subject:</span>
              <span>{testConfig.subject}</span>
            </div>
            <div className="test-info-item">
              <span>Questions:</span>
              <span>{testConfig.questions}</span>
            </div>
            <div className="test-info-item">
              <span>Format:</span>
              <span>{testConfig.format}</span>
            </div>
            <div className="test-info-item">
              <span>Paper Type:</span>
              <span>{testConfig.paperType}</span>
            </div>
          </div>
        </div>

        <div className="test-instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Read all questions carefully before answering</li>
            <li>For multiple choice questions, select the best answer</li>
            <li>Write clearly and legibly for descriptive answers</li>
            <li>Manage your time effectively</li>
            <li>Review your answers before submission</li>
          </ul>
        </div>

        {questions.map((question) => (
          <div key={question.id} className="question-container">
            <div className="question-header">
              <div className="question-number">Q{question.id}</div>
              <div className="question-text">{question.question}</div>
              {question.subject && testConfig.format === 'Mixed' && (
                <div className="question-subject">
                  {question.type === 'mcq' ? 'MCQ' : 'Short Answer'}
                </div>
              )}
            </div>

            {question.options && question.type === 'mcq' && (
              <div className="options-container">
                {question.options.map((option, index) => (
                  <div key={index} className="option">
                    <span className="option-label">{String.fromCharCode(65 + index)})</span>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
              </div>
            )}

            {(!question.options || question.type === 'short') && (
              <div className="short-answer-space">
                {/* Space for written answers */}
              </div>
            )}

            {testConfig.includeAnswers && (
              <div className="answer-section">
                <div className="answer-label">Answer:</div>
                <div className="answer-text">{question.answer}</div>
              </div>
            )}
          </div>
        ))}

        <div className="test-footer">
          <p>Generated by TutorLeap - AI-Powered Education Platform</p>
          <p>Test ID: {testConfig.timestamp} | Generated on: {new Date().toLocaleDateString()}</p>
          <p style={{ fontSize: '12px', marginTop: '5px', opacity: '0.7' }}>
            ✨ {testConfig.format === 'Mixed' ? `15 MCQ + ${testConfig.questions - 15} short answer questions from ${testConfig.subject}` : 'Questions generated using advanced AI technology'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
