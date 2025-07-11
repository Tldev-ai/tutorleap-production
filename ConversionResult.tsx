import React, { useEffect } from 'react';

interface ConversionResultProps {
  data: any;
  onBack: () => void;
}

const ConversionResult: React.FC<ConversionResultProps> = ({ data, onBack }) => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'conversion-result-styles';
    style.textContent = `
      .conversion-result {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-attachment: fixed;
        padding: 20px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .conversion-result::before {
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

      .container {
        max-width: 1200px;
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

      .comparison-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .comparison-title {
        color: white;
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 15px 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .comparison-subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: 18px;
        margin: 0;
      }

      .comparison-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 40px;
      }

      .board-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 30px;
      }

      .board-title {
        color: white;
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 20px 0;
        text-align: center;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .comparison-item {
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border-left: 3px solid #4facfe;
      }

      .item-label {
        color: #4facfe;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 5px;
        text-transform: uppercase;
      }

      .item-content {
        color: white;
        font-size: 16px;
        line-height: 1.5;
      }

      @media (max-width: 768px) {
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
      const existingStyle = document.getElementById('conversion-result-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  const renderComparisonData = () => {
    if (!data) return null;

    const { fromBoard, toBoard, subject, grade } = data;

    // Sample comparison data structure
    const comparisonData = {
      [fromBoard]: {
        nomenclature: `${fromBoard} Nomenclature`,
        gradingSystem: `${fromBoard} Grading System`,
        maxScore: '100 marks',
        assignmentTypes: 'Coursework, Projects, Tests',
        textbooks: `${fromBoard} prescribed textbooks`,
        schoolTypes: `${fromBoard} affiliated schools`,
        teachingApproach: `${fromBoard} methodology`,
        examSchedule: `${fromBoard} exam pattern`,
        supplementaryExam: 'Available',
        officialWebsite: `www.${fromBoard.toLowerCase()}.edu`,
        terminology: `${fromBoard} specific terms`
      },
      [toBoard]: {
        nomenclature: `${toBoard} Nomenclature`,
        gradingSystem: `${toBoard} Grading System`,
        maxScore: '100 marks',
        assignmentTypes: 'Assessments, Portfolios, Examinations',
        textbooks: `${toBoard} recommended textbooks`,
        schoolTypes: `${toBoard} certified schools`,
        teachingApproach: `${toBoard} pedagogy`,
        examSchedule: `${toBoard} assessment pattern`,
        supplementaryExam: 'Available',
        officialWebsite: `www.${toBoard.toLowerCase()}.edu`,
        terminology: `${toBoard} terminology guide`
      }
    };

    return (
      <div className="comparison-grid">
        <div className="board-card">
          <div className="board-title">{fromBoard}</div>
          {Object.entries(comparisonData[fromBoard]).map(([key, value]) => (
            <div key={key} className="comparison-item">
              <div className="item-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
              <div className="item-content">{value}</div>
            </div>
          ))}
        </div>

        <div className="board-card">
          <div className="board-title">{toBoard}</div>
          {Object.entries(comparisonData[toBoard]).map(([key, value]) => (
            <div key={key} className="comparison-item">
              <div className="item-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
              <div className="item-content">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="conversion-result">
      <div className="container">
        <button className="back-button" onClick={onBack}>
          ← Back to Converter
        </button>

        <div className="comparison-header">
          <div className="comparison-title">Curriculum Comparison Result</div>
          <div className="comparison-subtitle">
            {data?.fromBoard} vs {data?.toBoard} - {data?.subject} ({data?.grade})
          </div>
        </div>

        {renderComparisonData()}
      </div>
    </div>
  );
};

export default ConversionResult;
