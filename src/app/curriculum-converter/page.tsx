'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Board {
  id: number;
  board_code: string;
  board_name: string;
  full_name: string;
}

interface Grade {
  id: number;
  grade_number: number;
  grade_name: string;
}

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  board_id: number;
}

interface Topic {
  id: number;
  topic_name: string;
  topic_code?: string;
  subject_id: number;
  grade_id: number;
  board_id: number;
  parent_topic_id?: number;
  topic_level: number;
  topic_order: number;
}

interface FormData {
  fromBoard: string;
  toBoard: string;
  grade: string;
  subject: string;
  topics: string[];
  customTopic: string;  // Added this line
  questionCount: string;
  questionLevel: string;
  withAnswers: boolean;
  separatePapers: boolean;
  mockTests: boolean;
  quizzes: boolean;
  puzzles: boolean;
  scoreInput: string;
}

interface ConversionResults {
  fromBoard: string;
  toBoard: string;
  subject: string;
  grade: string;
  topics: string[];
  convertedContent: string;
}

export default function CurriculumConverter() {
  // State management
  const [boards, setBoards] = useState<Board[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversionResults, setConversionResults] = useState<ConversionResults | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    fromBoard: '',
    toBoard: '',
    grade: '',
    subject: '',
    topics: [],
    customTopic: '',  // Added this line
    questionCount: '10',
    questionLevel: 'medium',
    withAnswers: false,
    separatePapers: false,
    mockTests: false,
    quizzes: false,
    puzzles: false,
    scoreInput: ''
  });

  // Load initial data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load boards and grades
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch boards
      const { data: boardsData, error: boardsError } = await supabase
        .from('boards')
        .select('*')
        .order('board_name');
      
      if (boardsError) throw boardsError;
      setBoards(boardsData || []);

      // Fetch grades
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .order('grade_number');
      
      if (gradesError) throw gradesError;
      setGrades(gradesData || []);

    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load initial data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Load subjects when board changes
  const loadSubjects = async (boardId: string) => {
    if (!boardId) {
      setSubjects([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('board_id', boardId)
        .order('subject_name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Failed to load subjects.');
    }
  };

  // Load topics when subject, grade, and board are selected
  const loadTopics = async (subjectId: string, gradeId: string, boardId: string) => {
    if (!subjectId || !gradeId || !boardId) {
      setTopics([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('syllabus_topics')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('grade_id', gradeId)
        .eq('board_id', boardId)
        .order('topic_level', { ascending: true })
        .order('topic_order', { ascending: true });
      
      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      setError('Failed to load topics.');
    }
  };

  // Handle form field changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Load subjects when fromBoard changes
    if (field === 'fromBoard') {
      loadSubjects(value);
      setFormData(prev => ({ ...prev, subject: '', topics: [], customTopic: '' })); // Reset customTopic too
    }

    // Load topics when subject, grade changes
    if (field === 'subject' || field === 'grade') {
      const boardId = formData.fromBoard;
      const subjectId = field === 'subject' ? value : formData.subject;
      const gradeId = field === 'grade' ? value : formData.grade;
      
      if (boardId && subjectId && gradeId) {
        loadTopics(subjectId, gradeId, boardId);
      }
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field: keyof FormData, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  // Handle multi-select topics (keeping this for compatibility, but won't be used)
  const handleTopicsChange = (selectedOptions: HTMLCollectionOf<HTMLOptionElement>) => {
    const selectedValues = Array.from(selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      topics: selectedValues
    }));
  };

  // Convert curriculum
  const convertCurriculum = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate required fields (Updated validation)
      if (!formData.fromBoard || !formData.toBoard || !formData.grade || !formData.subject || !formData.customTopic?.trim()) {
        setError('Please fill in all required fields including the topic.');
        return;
      }

      // Simulate conversion process (replace with actual conversion logic)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock conversion results
      const results: ConversionResults = {
        fromBoard: boards.find(b => b.id.toString() === formData.fromBoard)?.board_name || '',
        toBoard: boards.find(b => b.id.toString() === formData.toBoard)?.board_name || '',
        subject: subjects.find(s => s.id.toString() === formData.subject)?.subject_name || '',
        grade: grades.find(g => g.id.toString() === formData.grade)?.grade_name || '',
        topics: formData.customTopic ? [formData.customTopic.trim()] : [], // Updated to use customTopic
        convertedContent: `### Teaching Approach Differences

**Current Method:** ${boards.find(b => b.id.toString() === formData.fromBoard)?.board_name} focuses on theoretical definitions with basic classification exercises and simple data collection.

**New Method:** ${boards.find(b => b.id.toString() === formData.toBoard)?.board_name} emphasizes hands-on data collection, real-world interpretation, and critical analysis with technology integration.

**Key Transition:** Shift from theoretical definitions to practical investigation and analysis-based teaching where students actively collect and interpret data.

### Sample Questions (${formData.questionCount} questions, ${formData.questionLevel} level)

1. Analyze the given dataset and identify patterns in the data distribution.
2. Design an experiment to collect quantitative data about student preferences.
3. Compare and contrast qualitative vs quantitative research methods.
4. Create a visual representation of the provided statistical data.
5. Evaluate the reliability of different data collection methods.

${formData.withAnswers ? '\n### Answer Key\n1. Students should identify trends, outliers, and distribution patterns...\n2. Experiment should include clear variables, sampling method...' : ''}

${formData.mockTests ? '\n### Mock Test Available\nA comprehensive mock test with 50 questions covering all topics.' : ''}
${formData.quizzes ? '\n### Interactive Quizzes\nShort quizzes for each topic to reinforce learning.' : ''}
${formData.puzzles ? '\n### Educational Puzzles\nData interpretation puzzles and statistical challenges.' : ''}`
      };

      setConversionResults(results);
      
    } catch (error) {
      console.error('Error converting curriculum:', error);
      setError('Failed to convert curriculum. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy content to clipboard
  const copyContent = async () => {
    if (conversionResults) {
      try {
        await navigator.clipboard.writeText(conversionResults.convertedContent);
        alert('Content copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy content:', error);
        alert('Failed to copy content. Please try again.');
      }
    }
  };

  // Download as PDF (mock implementation)
  const downloadPDF = () => {
    alert('PDF download functionality would be implemented here.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">🎓 Curriculum Converter</h1>
          <p className="text-xl opacity-90">Convert your curriculum between different educational boards seamlessly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Conversion Form */}
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              ✨ Convert Your Curriculum
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Board Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">From Board</label>
                  <select
                    value={formData.fromBoard}
                    onChange={(e) => handleInputChange('fromBoard', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select Board</option>
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>{board.board_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To Board</label>
                  <select
                    value={formData.toBoard}
                    onChange={(e) => handleInputChange('toBoard', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select Board</option>
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>{board.board_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grade and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>{grade.grade_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject_name} ({subject.subject_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic Input Field - UPDATED SECTION */}
              {formData.subject && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic AS PER THE SYLLABUS (Enter topic related to {subjects.find(s => s.id.toString() === formData.subject)?.subject_name})
                  </label>
                  <textarea
                    value={formData.customTopic || ''}
                    onChange={(e) => handleInputChange('customTopic', e.target.value)}
                    placeholder={`Enter a topic related to ${subjects.find(s => s.id.toString() === formData.subject)?.subject_name || 'the selected subject'}...`}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-24 resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Example: Cell Structure, Photosynthesis, Human Body Systems, etc.
                  </p>
                </div>
              )}

              {/* Question Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">HOW MANY questions you want</label>
                  <select
                    value={formData.questionCount}
                    onChange={(e) => handleInputChange('questionCount', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="10">10 Questions</option>
                    <option value="20">20 Questions</option>
                    <option value="30">30 Questions</option>
                    <option value="50">50 Questions</option>
                    <option value="50+">More than 50</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Level of the questions</label>
                  <select
                    value={formData.questionLevel}
                    onChange={(e) => handleInputChange('questionLevel', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Answer Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.withAnswers}
                        onChange={(e) => handleCheckboxChange('withAnswers', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Include Answer Key</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.separatePapers}
                        onChange={(e) => handleCheckboxChange('separatePapers', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Separate Answer Paper</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Additional Resources</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.mockTests}
                        onChange={(e) => handleCheckboxChange('mockTests', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Mock Tests</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.quizzes}
                        onChange={(e) => handleCheckboxChange('quizzes', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Quizzes</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.puzzles}
                        onChange={(e) => handleCheckboxChange('puzzles', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Puzzles</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Score Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Score Input (for mock tests)</label>
                <input
                  type="number"
                  value={formData.scoreInput}
                  onChange={(e) => handleInputChange('scoreInput', e.target.value)}
                  placeholder="Enter score for mock test"
                  min="0"
                  max="100"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Convert Button */}
              <button
                onClick={convertCurriculum}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Converting...
                  </div>
                ) : (
                  '🔄 Convert Curriculum'
                )}
              </button>
            </div>
          </div>

          {/* Conversion Results */}
          {conversionResults && (
            <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                📊 Conversion Results
              </h2>

              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 font-semibold">
                ✅ Conversion Completed Successfully!
              </div>

              <div className="bg-white p-5 rounded-lg mb-6 border border-gray-200">
                <div className="space-y-2">
                  <p><strong>From:</strong> {conversionResults.fromBoard} - {conversionResults.subject} - {conversionResults.grade}</p>
                  <p><strong>To:</strong> {conversionResults.toBoard} - {conversionResults.subject} - {conversionResults.grade}</p>
                  <p><strong>Topics:</strong> {conversionResults.topics.join(', ')}</p>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={copyContent}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  📋 Copy Content
                </button>
                <button
                  onClick={downloadPDF}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  📥 Download PDF
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Your Converted Lesson</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-line text-sm leading-relaxed">
                  {conversionResults.convertedContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}