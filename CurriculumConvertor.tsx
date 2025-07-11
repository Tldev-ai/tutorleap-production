


import React, { useState, useEffect } from 'react';

interface CurriculumConverterProps {
  onBack: () => void;
}

interface ConversionData {
  fromBoard: string;
  toBoard: string;
  grade: string;
  subject: string;
}

const CurriculumConverter: React.FC<CurriculumConverterProps> = ({ onBack }) => {
  const [conversionData, setConversionData] = useState<ConversionData>({
    fromBoard: '',
    toBoard: '',
    grade: '',
    subject: ''
  });

  const [showResult, setShowResult] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  const boards = ['CBSE', 'ICSE', 'IB', 'Cambridge IGCSE', 'State Board'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  
  const subjects = {
    'CBSE': {
      '1': ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge'],
      '2': ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge'],
      '3': ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'Science', 'General Knowledge'],
      '4': ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'Science', 'General Knowledge'],
      '5': ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'Science', 'General Knowledge'],
      '6': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
      '7': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
      '8': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
      '9': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Information Technology'],
      '10': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Information Technology'],
      '11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Core', 'Computer Science', 'Accountancy', 'Business Studies', 'Economics', 'Political Science', 'History', 'Geography', 'Psychology'],
      '12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Core', 'Computer Science', 'Accountancy', 'Business Studies', 'Economics', 'Political Science', 'History', 'Geography', 'Psychology']
    },
    'ICSE': {
      '1': ['English', 'Mathematics', 'Environmental Studies', 'Computer Studies', 'Arts Education'],
      '2': ['English', 'Mathematics', 'Environmental Studies', 'Computer Studies', 'Arts Education'],
      '3': ['English', 'Second Language', 'Mathematics', 'Environmental Studies', 'Computer Studies', 'Arts Education'],
      '4': ['English', 'Second Language', 'Mathematics', 'Environmental Studies', 'Computer Studies', 'Arts Education'],
      '5': ['English', 'Second Language', 'Mathematics', 'Environmental Studies', 'Computer Studies', 'Arts Education'],
      '6': ['English', 'Second Language', 'Mathematics', 'Science', 'Social Studies', 'Computer Studies', 'Third Language'],
      '7': ['English', 'Second Language', 'Mathematics', 'Science', 'Social Studies', 'Computer Studies', 'Third Language'],
      '8': ['English', 'Second Language', 'Mathematics', 'Science', 'Social Studies', 'Computer Studies', 'Third Language'],
      '9': ['English', 'Second Language', 'History', 'Civics', 'Geography', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Applications', 'Art', 'Physical Education', 'Technical Drawing Applications'],
      '10': ['English', 'Second Language', 'History', 'Civics', 'Geography', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Applications', 'Art', 'Physical Education', 'Technical Drawing Applications'],
      '11': ['English', 'Hindi', 'Sanskrit', 'French', 'German', 'Spanish', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Economics', 'History', 'Political Science', 'Sociology', 'Psychology', 'Commerce', 'Accounts', 'Business Studies', 'Fashion Designing', 'Home Science', 'Art', 'Physical Education'],
      '12': ['English', 'Hindi', 'Sanskrit', 'French', 'German', 'Spanish', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Economics', 'History', 'Political Science', 'Sociology', 'Psychology', 'Commerce', 'Accounts', 'Business Studies', 'Fashion Designing', 'Home Science', 'Art', 'Physical Education']
    },
    'IB': {
      '1': ['Language', 'Mathematics', 'Science', 'Social Studies', 'Arts', 'Personal/Social/Physical Education'],
      '2': ['Language', 'Mathematics', 'Science', 'Social Studies', 'Arts', 'Personal/Social/Physical Education'],
      '3': ['Language', 'Mathematics', 'Science', 'Social Studies', 'Arts', 'Personal/Social/Physical Education'],
      '4': ['Language', 'Mathematics', 'Science', 'Social Studies', 'Arts', 'Personal/Social/Physical Education'],
      '5': ['Language', 'Mathematics', 'Science', 'Social Studies', 'Arts', 'Personal/Social/Physical Education'],
      '6': ['Language and Literature', 'Language Acquisition', 'Individuals and Societies', 'Sciences', 'Mathematics', 'Arts', 'Physical and Health Education', 'Design'],
      '7': ['Language and Literature', 'Language Acquisition', 'Individuals and Societies', 'Sciences', 'Mathematics', 'Arts', 'Physical and Health Education', 'Design'],
      '8': ['Language and Literature', 'Language Acquisition', 'Individuals and Societies', 'Sciences', 'Mathematics', 'Arts', 'Physical and Health Education', 'Design'],
      '9': ['Language and Literature', 'Language Acquisition', 'Individuals and Societies', 'Sciences', 'Mathematics', 'Arts', 'Physical and Health Education', 'Design'],
      '10': ['Language and Literature', 'Language Acquisition', 'Individuals and Societies', 'Sciences', 'Mathematics', 'Arts', 'Physical and Health Education', 'Design'],
      '11': ['Studies in Language and Literature', 'Language Acquisition', 'Individuals and Societies', 'Sciences', 'Mathematics', 'The Arts'],
      '12': ['Studies in Language and Literature', 'Language Acquisition', 'Individuals and Societies', 'Sciences', 'Mathematics', 'The Arts']
    },
    'Cambridge IGCSE': {
      '1': ['English', 'Mathematics', 'Science', 'ICT', 'Humanities'],
      '2': ['English', 'Mathematics', 'Science', 'ICT', 'Humanities'],
      '3': ['English', 'Mathematics', 'Science', 'ICT', 'Humanities'],
      '4': ['English', 'Mathematics', 'Science', 'ICT', 'Humanities'],
      '5': ['English', 'Mathematics', 'Science', 'ICT', 'Humanities', 'Languages', 'Arts', 'Design and Technology'],
      '6': ['English', 'Mathematics', 'Science', 'Humanities', 'Social Sciences', 'Languages', 'Arts'],
      '7': ['English', 'Mathematics', 'Science', 'Humanities', 'Social Sciences', 'Languages', 'Arts'],
      '8': ['English', 'Mathematics', 'Science', 'Humanities', 'Social Sciences', 'Languages', 'Arts'],
      '9': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Business Studies', 'Economics', 'History', 'Geography'],
      '10': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Business Studies', 'Economics', 'History', 'Geography'],
      '11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'History', 'Geography', 'Economics', 'Business Studies', 'Psychology'],
      '12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'History', 'Geography', 'Economics', 'Business Studies', 'Psychology']
    },
    'State Board': {
      '1': ['Mathematics', 'English', 'Regional Language', 'Environmental Studies', 'General Knowledge'],
      '2': ['Mathematics', 'English', 'Regional Language', 'Environmental Studies', 'General Knowledge'],
      '3': ['Mathematics', 'English', 'Regional Language', 'Environmental Studies', 'General Knowledge'],
      '4': ['Mathematics', 'English', 'Regional Language', 'Environmental Studies', 'General Knowledge'],
      '5': ['Mathematics', 'English', 'Regional Language', 'Environmental Studies', 'General Knowledge'],
      '6': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language', 'General Knowledge'],
      '7': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language', 'General Knowledge'],
      '8': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language', 'General Knowledge'],
      '9': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language'],
      '10': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language'],
      '11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science', 'Psychology'],
      '12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science', 'Psychology']
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'curriculum-converter-styles';
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .curriculum-converter {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .curriculum-converter::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
        background-size: 400% 400%;
        animation: gradientShift 15s ease infinite;
        z-index: -1;
      }

      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .top-header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding: 15px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 10;
      }

      .header-left {
        display: flex;
        flex-direction: column;
      }

      .header-left h1 {
        color: white;
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .header-left .subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
        margin: 0;
        font-weight: 400;
      }

      .header-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }

      .welcome-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
        margin: 0;
      }

      .sign-out-btn {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 8px 16px;
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .sign-out-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .back-button {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 12px 20px;
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 30px;
      }

      .back-button:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .converter-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 40px;
        text-align: center;
      }

      .converter-title {
        color: white;
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 15px 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .converter-subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: 18px;
        margin: 0 0 40px 0;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 30px;
      }

      .form-group {
        text-align: left;
      }

      .form-label {
        display: block;
        color: white;
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      .form-select {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 16px;
        transition: all 0.3s ease;
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 16 16'%3e%3cpath d='m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
      }

      .form-select:focus {
        outline: none;
        border-color: #4facfe;
        background: rgba(255, 255, 255, 0.15);
      }

      .form-select option {
        background: #764ba2;
        color: white;
        padding: 10px;
      }

      .convert-button {
        width: 100%;
        max-width: 300px;
        padding: 16px 32px;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 20px;
      }

      .convert-button:hover:not(:disabled) {
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
      }

      .convert-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 10px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .result-container {
        margin-top: 40px;
        padding: 30px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
      }

      .result-title {
        color: white;
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 20px 0;
        text-align: center;
      }

      .comparison-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
      }

      .board-comparison {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        border-left: 4px solid #4facfe;
      }

      .board-name {
        color: #4facfe;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 15px 0;
      }

      .comparison-item {
        margin-bottom: 15px;
      }

      .item-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .item-value {
        color: white;
        font-size: 14px;
        line-height: 1.4;
      }

      @media (max-width: 768px) {
        .top-header {
          padding: 15px 20px;
        }

        .header-left h1 {
          font-size: 24px;
        }

        .header-left .subtitle {
          font-size: 14px;
        }

        .welcome-text {
          font-size: 14px;
        }

        .form-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        .comparison-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        .container {
          padding: 20px 15px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('curriculum-converter-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Update available subjects when TO BOARD or grade changes
  useEffect(() => {
    if (conversionData.toBoard && conversionData.grade) {
      const boardSubjects = subjects[conversionData.toBoard as keyof typeof subjects];
      if (boardSubjects) {
        const gradeSubjects = boardSubjects[conversionData.grade as keyof typeof boardSubjects] || [];
        setAvailableSubjects(gradeSubjects);
        
        // Reset subject if it's not available in the new grade/board combination
        if (!gradeSubjects.includes(conversionData.subject)) {
          setConversionData(prev => ({ ...prev, subject: '' }));
        }
      }
    } else {
      setAvailableSubjects([]);
      setConversionData(prev => ({ ...prev, subject: '' }));
    }
  }, [conversionData.toBoard, conversionData.grade]);

  const handleInputChange = (field: keyof ConversionData, value: string) => {
    setConversionData(prev => ({ ...prev, [field]: value }));
  };

  const handleConvert = async () => {
    if (!conversionData.fromBoard || !conversionData.toBoard || !conversionData.grade || !conversionData.subject) {
      alert('Please fill in all fields before converting.');
      return;
    }

    setIsConverting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConverting(false);
    setShowResult(true);
  };

  const isFormValid = conversionData.fromBoard && conversionData.toBoard && conversionData.grade && conversionData.subject;

  const renderComparisonResult = () => {
    const comparisonData = {
      [conversionData.fromBoard]: {
        nomenclature: `${conversionData.fromBoard} standard terminology`,
        gradingSystem: `${conversionData.fromBoard} assessment scale`,
        maxScore: '100 marks',
        assignmentTypes: 'Tests, Projects, Assignments',
        textbooks: `${conversionData.fromBoard} prescribed books`,
        schoolTypes: `${conversionData.fromBoard} affiliated institutions`,
        teachingApproach: `${conversionData.fromBoard} methodology`,
        examSchedule: `${conversionData.fromBoard} pattern`,
        supplementaryExam: 'Available',
        officialWebsite: `www.${conversionData.fromBoard.toLowerCase().replace(/\s+/g, '')}.edu`,
        terminology: `${conversionData.fromBoard} specific terms`
      },
      [conversionData.toBoard]: {
        nomenclature: `${conversionData.toBoard} standard terminology`,
        gradingSystem: `${conversionData.toBoard} assessment scale`,
        maxScore: '100 marks',
        assignmentTypes: 'Assessments, Portfolios, Examinations',
        textbooks: `${conversionData.toBoard} recommended books`,
        schoolTypes: `${conversionData.toBoard} certified institutions`,
        teachingApproach: `${conversionData.toBoard} pedagogy`,
        examSchedule: `${conversionData.toBoard} pattern`,
        supplementaryExam: 'Available',
        officialWebsite: `www.${conversionData.toBoard.toLowerCase().replace(/\s+/g, '')}.edu`,
        terminology: `${conversionData.toBoard} terminology guide`
      }
    };

    return (
      <div className="result-container">
        <div className="result-title">Curriculum Comparison Result</div>
        <div className="comparison-grid">
          <div className="board-comparison">
            <div className="board-name">{conversionData.fromBoard}</div>
            {Object.entries(comparisonData[conversionData.fromBoard]).map(([key, value]) => (
              <div key={key} className="comparison-item">
                <div className="item-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                <div className="item-value">{value}</div>
              </div>
            ))}
          </div>

          <div className="board-comparison">
            <div className="board-name">{conversionData.toBoard}</div>
            {Object.entries(comparisonData[conversionData.toBoard]).map(([key, value]) => (
              <div key={key} className="comparison-item">
                <div className="item-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                <div className="item-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="curriculum-converter">
      <div className="top-header">
        <div className="header-left">
          <h1>TutorLeap</h1>
          <p className="subtitle">AI-Powered Education Platform</p>
        </div>
        <div className="header-right">
          <p className="welcome-text">Welcome, demo.iituitions@gmail.com</p>
          <button className="sign-out-btn">Sign Out</button>
        </div>
      </div>

      <div className="container">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div className="converter-card">
          <div className="converter-title">🔄 Curriculum Converter</div>
          <div className="converter-subtitle">
            Convert and compare curricula between different education boards
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">From Board</label>
              <select 
                className="form-select"
                value={conversionData.fromBoard}
                onChange={(e) => handleInputChange('fromBoard', e.target.value)}
              >
                <option value="">Select Source Board</option>
                {boards.map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">To Board</label>
              <select 
                className="form-select"
                value={conversionData.toBoard}
                onChange={(e) => handleInputChange('toBoard', e.target.value)}
              >
                <option value="">Select Target Board</option>
                {boards.map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Grade</label>
              <select 
                className="form-select"
                value={conversionData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select 
                className="form-select"
                value={conversionData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                disabled={!conversionData.toBoard || !conversionData.grade}
              >
                <option value="">Select Subject</option>
                {availableSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            className="convert-button" 
            onClick={handleConvert}
            disabled={!isFormValid || isConverting}
          >
            {isConverting && <span className="loading-spinner"></span>}
            {isConverting ? 'Converting...' : 'Convert Curriculum'}
          </button>

          {showResult && renderComparisonResult()}
        </div>
      </div>
    </div>
  );
};

export default CurriculumConverter;
