// src/app/converter/page.tsx
'use client';

import React, { useState } from 'react';

interface FormData {
  fromBoard: string;
  toBoard: string;
  subject: string;
  grade: string;
  topic: string;
  content: string;
}

interface ConversionResult {
  success: boolean;
  boardDifferences?: {
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
  };
  metadata?: {
    fromBoard: string;
    toBoard: string;
    subject: string;
    grade: string;
    topic: string;
    convertedAt: string;
    conversionId: string;
  };
  error?: string;
  validationErrors?: string[];
}

export default function ConverterPage() {
  const [formData, setFormData] = useState<FormData>({
    fromBoard: 'CBSE',
    toBoard: 'IGCSE (Cambridge)',
    subject: 'Mathematics',
    grade: 'Grade 7',
    topic: 'statistics',
    content: 'qualitative and quantitative'
  });

  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear previous errors when user types
    setError(null);
    setResult(null);
  };

  const handleConvert = async () => {
    // Validate form before submitting
    const errors: string[] = [];
    if (!formData.fromBoard.trim()) errors.push('From Board is required');
    if (!formData.toBoard.trim()) errors.push('To Board is required');
    if (!formData.subject.trim()) errors.push('Subject is required');
    if (!formData.grade.trim()) errors.push('Grade is required');
    if (!formData.topic.trim()) errors.push('Topic is required');
    if (!formData.content.trim()) errors.push('Lesson Content is required');

    if (errors.length > 0) {
      setError('Please fill in all required fields: ' + errors.join(', '));
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Sending conversion request:', formData);
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (data.success) {
        setResult(data);
        setError(null);
      } else {
        setError(data.error || 'Conversion failed');
        if (data.validationErrors) {
          console.log('Validation errors:', data.validationErrors);
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
      setError(errorMessage);
      console.error('Conversion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result?.boardDifferences) return;
    
    const content = generateCopyContent(result);
    try {
      await navigator.clipboard.writeText(content);
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy content');
    }
  };

  const generateCopyContent = (result: ConversionResult): string => {
    if (!result.boardDifferences || !result.metadata) return '';
    
    const { boardDifferences, metadata } = result;
    
    return `TutorLeap Curriculum Conversion
From: ${metadata.fromBoard} - ${metadata.subject} - ${metadata.grade}
To: ${metadata.toBoard} - ${metadata.subject} - ${metadata.grade}
Topic: ${metadata.topic}
Generated: ${new Date(metadata.convertedAt).toLocaleString()}

### 1. Teaching Approach Differences
Current Method: ${boardDifferences.teachingApproach.currentMethod}
New Method: ${boardDifferences.teachingApproach.newMethod}
Key Transition: ${boardDifferences.teachingApproach.keyTransition}

### 2. Assessment Style Changes
Current Questions: ${boardDifferences.assessmentStyle.currentQuestions}
New Questions: ${boardDifferences.assessmentStyle.newQuestions}
Marking Difference: ${boardDifferences.assessmentStyle.markingDifference}

### 3. Common Mistakes to Avoid
${boardDifferences.commonMistakes.map((mistake, i) => `${i + 1}. ${mistake}`).join('\n')}

### 4. Your Action Plan
${boardDifferences.actionableSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

### 5. Income Impact
${boardDifferences.incomeImpact}

---
Generated by TutorLeap`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transform your CBSE knowledge to international formats in 30 seconds
          </h1>
          <p className="text-lg">
            <span className="text-orange-500">⚡</span>
            <span className="text-green-600 font-semibold">₹300/hour</span>
            <span className="text-gray-500 mx-2">→</span>
            <span className="text-green-600 font-semibold">₹1,500/hour</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-blue-600 text-2xl mr-3">✨</span>
              <h2 className="text-2xl font-bold text-gray-900">Convert Your Curriculum</h2>
            </div>

            <div className="space-y-6">
              {/* Board Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Board</label>
                  <select 
                    value={formData.fromBoard}
                    onChange={(e) => handleInputChange('fromBoard', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Board</label>
                  <select
                    value={formData.toBoard}
                    onChange={(e) => handleInputChange('toBoard', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="IGCSE (Cambridge)">IGCSE (Cambridge)</option>
                    <option value="IB">IB</option>
                    <option value="A-Levels">A-Levels</option>
                  </select>
                </div>
              </div>

              {/* Subject and Grade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., statistics, algebra, geometry"
                />
              </div>

              {/* Lesson Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your lesson content, topic details, or specific concepts you want to convert..."
                />
              </div>

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                disabled={isLoading || !formData.content.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Converting...
                  </>
                ) : (
                  'Convert Curriculum'
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 font-medium">⚠️ Error</div>
                  <div className="text-red-600 text-sm mt-1">{error}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-green-600 text-2xl mr-3">📋</span>
              <h2 className="text-2xl font-bold text-gray-900">Conversion Results</h2>
            </div>

            {result?.success && result.boardDifferences ? (
              <div className="space-y-6">
                {/* Success Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 font-semibold flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Conversion Completed Successfully!
                  </div>
                  {result.metadata && (
                    <div className="text-green-600 text-sm mt-2 space-y-1">
                      <div><strong>From:</strong> {result.metadata.fromBoard} - {result.metadata.subject} - {result.metadata.grade}</div>
                      <div><strong>To:</strong> {result.metadata.toBoard} - {result.metadata.subject} - {result.metadata.grade}</div>
                      <div><strong>Topic:</strong> {result.metadata.topic}</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    📋 Copy Content
                  </button>
                  <button className="flex-1 bg-green-50 text-green-600 py-2 px-4 rounded-lg font-medium border border-green-200 hover:bg-green-100 transition-colors">
                    ⬇️ Download PDF
                  </button>
                </div>

                {/* Conversion Results */}
                <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Converted Lesson</h3>
                  
                  {/* Teaching Approach */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">### 1. Teaching Approach Differences</h4>
                    <div className="space-y-3 text-sm bg-white p-4 rounded border">
                      <div><strong>Current Method:</strong> {result.boardDifferences.teachingApproach.currentMethod}</div>
                      <div><strong>New Method:</strong> {result.boardDifferences.teachingApproach.newMethod}</div>
                      <div className="bg-yellow-50 p-3 rounded"><strong>Key Transition:</strong> {result.boardDifferences.teachingApproach.keyTransition}</div>
                    </div>
                  </div>

                  {/* Assessment Style */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">### 2. Assessment Differences</h4>
                    <div className="space-y-3 text-sm bg-white p-4 rounded border">
                      <div><strong>Current Questions:</strong> {result.boardDifferences.assessmentStyle.currentQuestions}</div>
                      <div><strong>New Questions:</strong> {result.boardDifferences.assessmentStyle.newQuestions}</div>
                      <div><strong>Marking Difference:</strong> {result.boardDifferences.assessmentStyle.markingDifference}</div>
                    </div>
                  </div>

                  {/* Common Mistakes */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">### 3. Common Mistakes to Avoid</h4>
                    <ul className="space-y-1 text-sm bg-white p-4 rounded border">
                      {result.boardDifferences.commonMistakes.map((mistake, index) => (
                        <li key={index}>• {mistake}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Steps */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">### 4. Your Action Plan</h4>
                    <ul className="space-y-1 text-sm bg-white p-4 rounded border">
                      {result.boardDifferences.actionableSteps.map((step, index) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Income Impact */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">💰 Income Impact</h4>
                    <p className="text-yellow-700 text-sm">{result.boardDifferences.incomeImpact}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Convert</h3>
                <p className="text-gray-500">
                  Fill in your lesson details and click "Convert Curriculum" to see your international format lesson here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}