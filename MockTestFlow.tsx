
import React, { useState } from 'react';
import MockTestCreator from './MockTestCreator';
import TestResultPage from './TestResultPage';

interface MockTestFlowProps {
  onBack: () => void;
}

interface TestConfig {
  board: string;
  grade: string;
  subject: string;
  paperType: string;
  questions: number;
  format: string;
  includeAnswers: boolean;
  timestamp: number;
}

const MockTestFlow: React.FC<MockTestFlowProps> = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState<'creator' | 'result'>('creator');
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);

  const handleBackToDashboard = () => {
    onBack();
  };

  const handleTestGenerated = (config: TestConfig) => {
    setTestConfig(config);
    setCurrentPage('result');
  };

  const handleBackToCreator = () => {
    setCurrentPage('creator');
    setTestConfig(null);
  };

  if (currentPage === 'creator') {
    return (
      <MockTestCreator
        onBack={handleBackToDashboard}
        onGenerateTest={handleTestGenerated}
      />
    );
  }

  if (currentPage === 'result' && testConfig) {
    return (
      <TestResultPage
        testConfig={testConfig}
        onBack={handleBackToCreator}
      />
    );
  }

  // Fallback
  return (
    <MockTestCreator
      onBack={handleBackToDashboard}
      onGenerateTest={handleTestGenerated}
    />
  );
};

export default MockTestFlow;
