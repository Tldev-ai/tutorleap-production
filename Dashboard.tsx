// src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [peopleUsed, setPeopleUsed] = useState(0);
  const [testsGenerated, setTestsGenerated] = useState(0);

  // Animated counter effect
  useEffect(() => {
    // Animate people used counter
    const peopleInterval = setInterval(() => {
      setPeopleUsed(prev => prev < 12752 ? prev + 127 : 12752);
    }, 20);

    // Animate tests generated counter
    const testsInterval = setInterval(() => {
      setTestsGenerated(prev => prev < 2675 ? prev + 26 : 2675);
    }, 20);

    return () => {
      clearInterval(peopleInterval);
      clearInterval(testsInterval);
    };
  }, []);

  // Inject styles
  useEffect(() => {
    const styleId = 'dashboard-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Dashboard Styles */
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dashboard-section {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        text-align: center;
      }

      .dashboard-section:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        background: rgba(255, 255, 255, 0.15);
      }

      .stats-bar {
        background: linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3));
        backdrop-filter: blur(15px);
        border-radius: 15px;
        padding: 1rem 2rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
        font-size: 1.1rem;
        font-weight: 600;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .section-title {
        font-size: 2rem;
        font-weight: 700;
        color: white;
        margin-bottom: 1rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .section-description {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 2rem;
        line-height: 1.6;
      }

      .dashboard-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .dashboard-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      }

      .review-boxes {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
      }

      .review-box {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(15px);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
        transition: all 0.3s ease;
        min-height: 150px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        cursor: pointer;
      }

      .review-box:hover {
        transform: translateY(-3px);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .review-box-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }

      .review-box-title {
        font-size: 1.3rem;
        font-weight: 600;
        color: white;
        margin-bottom: 0.5rem;
      }

      .review-box-subtitle {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 1rem;
      }

      .star-rating {
        color: #ffd700;
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }

      .review-count {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .dashboard-container {
          padding: 1rem;
        }
        
        .dashboard-section {
          padding: 1.5rem;
        }
        
        .section-title {
          font-size: 1.5rem;
        }
        
        .review-boxes {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Curriculum Converter */}
      <div className="dashboard-section">
        <div className="section-title">📚 Curriculum Converter</div>
        <div className="section-description">
          Convert between education boards seamlessly with AI-powered analysis
        </div>
        <button 
          className="dashboard-button"
          onClick={() => onNavigate('converter')}
        >
          Start Conversion
        </button>
      </div>

      {/* Stats Bar 1 */}
      <div className="stats-bar">
        👥 {peopleUsed.toLocaleString()} people used past days
      </div>

      {/* Mock Tests Generator */}
      <div className="dashboard-section">
        <div className="section-title">🎯 Mock Tests/Quiz/Puzzles Generator</div>
        <div className="section-description">
          Generate practice tests, quizzes, and puzzles for comprehensive learning
        </div>
        <button 
          className="dashboard-button"
          onClick={() => onNavigate('mocktest')}
        >
          Create Test
        </button>
      </div>

      {/* Stats Bar 2 */}
      <div className="stats-bar">
        📊 {testsGenerated.toLocaleString()} tests generated
      </div>

      {/* Review Section */}
      <div className="dashboard-section">
        <div className="section-title">⭐ Review</div>
        <div className="section-description">
          Review your progress, results, and get feedback from teachers and parents
        </div>
        <button 
          className="dashboard-button"
          onClick={() => alert('Review functionality coming soon!')}
        >
          View Reviews
        </button>
      </div>

      {/* 4 Review Boxes */}
      <div className="review-boxes">
        <div className="review-box" onClick={() => alert('Teacher Review functionality coming soon!')}>
          <div className="review-box-icon">👨‍🏫</div>
          <div className="review-box-title">Teacher Review</div>
          <div className="review-box-subtitle">Get feedback from educators</div>
          <div className="star-rating">⭐⭐⭐⭐⭐</div>
          <div className="review-count">124 reviews</div>
        </div>

        <div className="review-box" onClick={() => alert('Parent Review functionality coming soon!')}>
          <div className="review-box-icon">👨‍👩‍👧‍👦</div>
          <div className="review-box-title">Parent Review</div>
          <div className="review-box-subtitle">Parental feedback & support</div>
          <div className="star-rating">⭐⭐⭐⭐⭐</div>
          <div className="review-count">89 reviews</div>
        </div>

        <div className="review-box" onClick={() => alert('Teacher Review functionality coming soon!')}>
          <div className="review-box-icon">👨‍🏫</div>
          <div className="review-box-title">Teacher Review</div>
          <div className="review-box-subtitle">Academic performance insights</div>
          <div className="star-rating">⭐⭐⭐⭐⭐</div>
          <div className="review-count">156 reviews</div>
        </div>

        <div className="review-box" onClick={() => alert('Parent Review functionality coming soon!')}>
          <div className="review-box-icon">👨‍👩‍👧‍👦</div>
          <div className="review-box-title">Parent Review</div>
          <div className="review-box-subtitle">Progress tracking & guidance</div>
          <div className="star-rating">⭐⭐⭐⭐⭐</div>
          <div className="review-count">201 reviews</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
