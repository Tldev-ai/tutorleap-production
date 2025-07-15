import React, { useState, useEffect } from 'react';

interface MockTestCreatorProps {
  onBack: () => void;
  onGenerateTest: (testConfig: any) => void;
}

const MockTestCreator: React.FC<MockTestCreatorProps> = ({ onBack, onGenerateTest }) => {
  // State variables
  const [board, setBoard] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [paperType, setPaperType] = useState('Paper 1 (45 MCQs)');
  const [questions, setQuestions] = useState('45');
  const [format, setFormat] = useState('MCQ');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Basic data arrays
  const boards = ['CBSE', 'ICSE', 'IB', 'Cambridge IGCSE', 'State Board'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const paperTypes = [
    { value: 'Paper 1 (45 MCQs)', questions: '45', format: 'MCQ' },
    { value: 'Paper 2 (23 Mixed)', questions: '23', format: 'Mixed' },
    { value: 'Paper 4 (Extended)', questions: '15', format: 'Extended' }
  ];// Complete subjects database for all 5 boards
  const subjectsByBoard: Record<string, Record<string, string[]>> = {
    'CBSE': {
      '1-5': ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Arts and Craft', 'Health and Physical Education'],
      '6-8': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Third Language', 'Health and Physical Education', 'Art Education', 'Work Experience'],
      '9-10': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
      '11-12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi/Other Languages', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Political Science', 'Geography', 'Psychology', 'Sociology']
    },
    'ICSE': {
      '1-5': ['English', 'Mathematics', 'Second Language', 'Environmental Studies (EVS)', 'Computer Studies', 'Arts Education'],
      '6-8': ['English', 'Mathematics', 'Science', 'Social Studies', 'Second Language', 'Computer Applications', 'Commercial Applications', 'Economics', 'Environmental Science', 'Physical Education', 'Arts'],
      '9-10': ['English', 'Second Language', 'History', 'Civics', 'Geography', 'Mathematics', 'Science', 'Computer Applications', 'Commercial Applications', 'Economics', 'Environmental Science', 'Physical Education', 'Arts', 'Music'],
      '11-12': ['English (Language and Literature)', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Accountancy', 'Economics', 'Business Studies', 'History', 'Geography', 'Political Science', 'Psychology', 'Sociology', 'Computer Applications', 'Art', 'Physical Education']
    },
    'IB': {
      '1-5': ['Language (English)', 'Mathematics', 'Science', 'Social Studies', 'Arts', 'Physical Education'],
      '6-10': ['Language and Literature (English)', 'Language Acquisition (Second Language)', 'Individuals and Societies', 'Sciences', 'Mathematics', 'Arts', 'Physical and Health Education', 'Design'],
      '11-12': ['Studies in Language and Literature', 'Language Acquisition', 'Individuals and Societies', 'Sciences', 'Mathematics', 'The Arts', 'Extended Essay', 'Theory of Knowledge (TOK)', 'Creativity, Activity, Service (CAS)']
    },
    'Cambridge IGCSE': {
      '1-6': ['English', 'Mathematics', 'Science'],
      '7-9': ['English', 'Mathematics', 'Science'],
      '9-10': ['First Language English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Business Studies', 'Computer Science', 'Art & Design', 'Music', 'Physical Education'],
      '11-12': ['Mathematics', 'Biology', 'Chemistry', 'Physics', 'English Literature', 'History', 'Geography', 'Economics', 'Business', 'Psychology', 'Computer Science', 'Art & Design']
    },
    'State Board': {
      '1-5': ['हिंदी/Regional Language', 'English', 'Mathematics', 'Environmental Studies (पर्यावरण अध्ययन)', 'Arts & Crafts', 'Physical Education'],
      '6-8': ['हिंदी', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
      '9-10': ['हिंदी', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
      '11-12': ['हिंदी', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Geography', 'Political Science', 'Economics', 'Accountancy', 'Business Studies', 'Psychology', 'Sociology', 'Home Science', 'Agriculture', 'Computer Science']
    }
  };
  // Comprehensive topics database for all boards, grades, and subjects
  const topicsByBoardGradeSubject: Record<string, Record<string, string[]>> = {
    'CBSE': {
      // Primary Grades (1-5) Topics
      'Mathematics-1-5': ['Numbers 1-20', 'Basic Addition', 'Basic Subtraction', 'Shapes Recognition', 'Simple Patterns', 'Measurement Basics', 'Time and Calendar', 'Money Concepts', 'Data Handling'],
      'English-1-5': ['Alphabet Learning', 'Phonics', 'Simple Words', 'Basic Grammar', 'Reading Stories', 'Creative Writing', 'Vocabulary Building', 'Speaking Skills'],
      'Hindi-1-5': ['वर्णमाला', 'मात्रा', 'शब्द निर्माण', 'सरल वाक्य', 'कहानी सुनना', 'लेखन अभ्यास'],
      'Environmental Studies-1-5': ['My Family', 'My Home', 'Plants Around Us', 'Animals Around Us', 'Food We Eat', 'Weather', 'Transport', 'Festivals'],
      'General Knowledge-1-5': ['National Symbols', 'Colors and Shapes', 'Days and Months', 'Body Parts', 'Community Helpers', 'Basic Geography'],
      'Arts and Craft-1-5': ['Drawing', 'Coloring', 'Paper Craft', 'Clay Work', 'Music Basics', 'Dance Movements'],
      'Health and Physical Education-1-5': ['Body Parts', 'Healthy Habits', 'Simple Exercises', 'Basic Games', 'Safety Rules'],

      // Middle Grades (6-8) Topics
      'Mathematics-6-8': ['Integers', 'Fractions and Decimals', 'Algebra Basics', 'Simple Equations', 'Lines and Angles', 'Triangles', 'Perimeter and Area', 'Data Handling', 'Ratio and Proportion'],
      'Science-6-8': ['Food and Nutrition', 'Light Shadow and Reflection', 'Motion and Time', 'Electric Current', 'Acids Bases and Salts', 'Weather Climate', 'Respiration in Organisms', 'Transportation', 'Reproduction in Plants'],
      'Social Science-6-8': ['Our Past', 'Earth Our Habitat', 'Social and Political Life', 'Diversity and Livelihood', 'Government', 'Rural and Urban Society', 'Gender and Inequality'],
      'English-6-8': ['Reading Comprehension', 'Grammar Advanced', 'Creative Writing', 'Poetry Analysis', 'Story Writing', 'Letter Writing', 'Vocabulary Expansion'],
      'Hindi-6-8': ['काव्य और गद्य', 'व्याकरण', 'रचनात्मक लेखन', 'साहित्य परिचय', 'निबंध लेखन'],

      // Secondary Grades (9-10) Topics
      'Mathematics-9-10': ['Real Numbers', 'Polynomials', 'Linear Equations in Two Variables', 'Coordinate Geometry', 'Introduction to Trigonometry', 'Applications of Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
      'Science-9-10': ['Matter in Our Surroundings', 'Atoms and Molecules', 'Structure of Atom', 'Life Processes', 'Control and Coordination', 'Heredity and Evolution', 'Light Reflection and Refraction', 'Human Eye', 'Electricity', 'Magnetic Effects of Electric Current', 'Sources of Energy', 'Natural Resource Management'],
      'Social Science-9-10': ['French Revolution', 'Socialism in Europe', 'Nazism and Hitler', 'Forest Society', 'Pastoralists', 'Peasants and Farmers', 'Constitutional Design', 'Electoral Politics', 'Working of Democracy', 'Democratic Rights', 'Economics', 'Sectors of Economy', 'Money and Credit', 'Globalization'],
      'English-9-10': ['Literature Reader', 'Grammar and Writing', 'Reading Skills', 'Writing Skills', 'Speaking and Listening'],
      'Hindi-9-10': ['गद्य खंड', 'काव्य खंड', 'व्याकरण', 'रचना', 'साहित्य इतिहास'],

      // Higher Secondary (11-12) - Science Stream
      'Mathematics-11-12': ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Complex Numbers', 'Linear Inequalities', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series', 'Straight Lines', 'Conic Sections', 'Limits and Derivatives', 'Statistics', 'Probability', 'Matrices', 'Determinants', 'Continuity and Differentiability', 'Applications of Derivatives', 'Integrals', 'Applications of Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry'],
      'Physics-11-12': ['Physical World', 'Units and Measurements', 'Motion in Straight Line', 'Motion in Plane', 'Laws of Motion', 'Work Energy Power', 'System of Particles', 'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves', 'Electric Charges and Fields', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics', 'Wave Optics', 'Dual Nature of Radiation', 'Atoms', 'Nuclei', 'Semiconductor Electronics', 'Communication Systems'],
      'Chemistry-11-12': ['Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Hydrogen', 's-Block Elements', 'p-Block Elements', 'Organic Chemistry Principles', 'Hydrocarbons', 'Environmental Chemistry', 'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'General Principles of Extraction', 'd and f Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols Phenols Ethers', 'Aldehydes Ketones', 'Carboxylic Acids', 'Organic Compounds with Nitrogen', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'],
      'Biology-11-12': ['Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 'Cell Unit of Life', 'Biomolecules', 'Cell Cycle and Division', 'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis', 'Respiration in Plants', 'Plant Growth and Development', 'Digestion and Absorption', 'Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products', 'Locomotion and Movement', 'Neural Control and Coordination', 'Chemical Coordination', 'Sexual Reproduction in Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health and Disease', 'Microbes in Human Welfare', 'Biotechnology Principles', 'Biotechnology Applications', 'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues'],

      // Commerce Stream
      'Accountancy-11-12': ['Introduction to Accounting', 'Theory Base of Accounting', 'Recording of Transactions', 'Bank Reconciliation Statement', 'Bills of Exchange', 'Capital and Revenue', 'Depreciation', 'Provisions and Reserves', 'Bad Debts', 'Financial Statements', 'Accounting Ratios', 'Cash Flow Statement', 'Partnership Accounts', 'Admission of Partner', 'Retirement of Partner', 'Dissolution of Partnership', 'Company Accounts', 'Issue of Shares', 'Issue of Debentures', 'Redemption of Debentures', 'Financial Statement Analysis'],
      'Business Studies-11-12': ['Nature and Significance of Management', 'Principles of Management', 'Business Environment', 'Planning', 'Organizing', 'Staffing', 'Directing', 'Controlling', 'Business Finance', 'Financial Markets', 'Marketing', 'Consumer Protection', 'Entrepreneurship Development'],
      'Economics-11-12': ['Introduction to Economics', 'Consumer Equilibrium', 'Demand', 'Elasticity of Demand', 'Production and Costs', 'Supply and Market Equilibrium', 'Competition', 'National Income', 'Money and Banking', 'Income Determination', 'Government Budget', 'Balance of Payments', 'Indian Economy on the Eve of Independence', 'Indian Economy 1950-1990', 'Liberalization Privatization Globalization', 'Poverty', 'Human Capital Formation', 'Rural Development', 'Employment', 'Sustainable Development'],

      // Arts Stream
      'History-11-12': ['Beginning of Time', 'Writing and City Life', 'Early State', 'Central Islamic Lands', 'Changing Cultural Traditions', 'Industrial Revolution', 'Displacing Indigenous Peoples', 'Peasants Zamindars and State', 'Kings and Chronicles', 'Colonial Cities', 'Rebels and Raj', 'Mahatma Gandhi', 'Understanding Partition', 'Framing the Constitution', 'Constitution as Living Document'],
      'Political Science-11-12': ['Political Theory Introduction', 'Freedom', 'Equality', 'Social Justice', 'Rights', 'Citizenship', 'Nationalism', 'Secularism', 'Peace', 'Development', 'Constitution Why and How', 'Rights in Indian Constitution', 'Election and Representation', 'Executive', 'Legislature', 'Judiciary', 'Federalism', 'Local Governments', 'Constitution as Living Document', 'Philosophy of Constitution'],
      'Geography-11-12': ['Geography as Discipline', 'Earth', 'Landforms', 'Climate', 'Water', 'Natural Vegetation', 'Soils', 'Natural Hazards', 'Human Geography Nature', 'People', 'Human Development', 'Primary Activities', 'Secondary Activities', 'Tertiary Activities', 'Population Distribution', 'Migration', 'Human Settlements', 'Land Resources', 'Water Resources', 'Mineral and Energy Resources', 'Planning and Sustainable Development', 'Transport and Communication', 'International Trade', 'Geographical Perspective'],
      'Psychology-11-12': ['संज्ञानात्मक मनोविज्ञान', 'सामाजिक मनोविज्ञान', 'विकासात्मक मनोविज्ञान', 'व्यक्तित्व मनोविज्ञान', 'असामान्य मनोविज्ञान', 'शैक्षिक मनोविज्ञान', 'परामर्श मनोविज्ञान', 'अनुप्रयुक्त मनोविज्ञान'],
      'Sociology-11-12': ['सामाजिक संरचना', 'सामाजिक परिवर्तन', 'भारतीय समाज', 'सामाजिक समस्याएं', 'सामाजिक संस्थाएं', 'सामुदायिक विकास', 'सामाजिक अनुसंधान', 'समाजशास्त्रीय सिद्धांत']
    },
    'ICSE': {
      // Primary/Middle School (1-5)
      'English-1-5': ['Alphabet and Phonics', 'Reading Comprehension', 'Vocabulary Building', 'Basic Grammar', 'Creative Writing', 'Storytelling', 'Poetry Recitation'],
      'Mathematics-1-5': ['Number Concepts', 'Basic Operations', 'Shapes and Patterns', 'Measurement', 'Time and Money', 'Data Handling'],
      'Second Language-1-5': ['Basic Vocabulary', 'Simple Sentences', 'Reading and Writing', 'Cultural Stories'],
      'Environmental Studies (EVS)-1-5': ['Living and Non-living', 'Plants and Animals', 'Our Environment', 'Community Helpers', 'Safety and Health'],
      'Computer Studies-1-5': ['Computer Parts', 'Basic Functions', 'Simple Programs', 'Drawing Programs'],
      'Arts Education-1-5': ['Drawing and Painting', 'Music Basics', 'Craft Work', 'Creative Expression'],
      
      // Middle School (6-8)
      'English-6-8': ['Advanced Reading', 'Grammar Rules', 'Essay Writing', 'Literature Appreciation', 'Communication Skills'],
      'Mathematics-6-8': ['Integers', 'Fractions', 'Algebra Introduction', 'Geometry', 'Mensuration', 'Statistics'],
      'Science-6-8': ['Scientific Method', 'Physics Concepts', 'Chemistry Basics', 'Biology Studies', 'Environmental Science'],
      'Social Studies-6-8': ['History Timeline', 'Geography Mapping', 'Civics and Government', 'Economics Basics'],
      'Computer Applications-6-8': ['Programming Basics', 'Software Applications', 'Internet Safety', 'Digital Citizenship'],
      
      // Secondary School (9-10)
      'Mathematics-9-10': ['Commercial Mathematics', 'Algebra', 'Geometry', 'Mensuration', 'Trigonometry', 'Statistics', 'Probability'],
      'Biology-9-10': ['Cell Biology', 'Plant Studies', 'Human Biology', 'Genetics', 'Evolution', 'Ecology'],
      'Chemistry-9-10': ['Matter and Materials', 'Atomic Structure', 'Chemical Bonding', 'Acids and Bases', 'Metals and Non-metals', 'Organic Chemistry'],
      'Physics-9-10': ['Measurements', 'Motion', 'Force and Energy', 'Heat', 'Light', 'Sound', 'Electricity', 'Magnetism'],
      'History-9-10': ['World History', 'Indian Freedom Struggle', 'Civilizations', 'Colonial Period', 'Nationalism'],
      'Geography-9-10': ['Natural Vegetation', 'Agriculture', 'Minerals and Power', 'Transport', 'Human Geography'],
      'English-9-10': ['Literature Analysis', 'Language Study', 'Writing Skills', 'Oral Communication'],

      // Higher Secondary (11-12)
      'Physics-11-12': ['Mechanics', 'Properties of Matter', 'Heat and Thermodynamics', 'Oscillations and Waves', 'Electricity and Magnetism', 'Modern Physics'],
      'Chemistry-11-12': ['Atomic Structure', 'Chemical Bonding', 'States of Matter', 'Chemical Thermodynamics', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Organic Chemistry', 'Inorganic Chemistry'],
      'Biology-11-12': ['Diversity of Life', 'Structural Organization', 'Cell Biology', 'Plant Physiology', 'Human Physiology', 'Reproduction', 'Genetics and Evolution', 'Ecology and Environment', 'Biology and Human Welfare', 'Biotechnology'],
      'Mathematics-11-12': ['Relations and Functions', 'Algebra', 'Calculus', 'Vectors', 'Statistics and Probability', 'Linear Programming']
    },

    'IB': {
      // Primary Years Programme (PYP) - Grades 1-5
      'Language (English)-1-5': ['Phonics Development', 'Reading Fluency', 'Writing Skills', 'Oral Communication', 'Literature Appreciation'],
      'Mathematics-1-5': ['Number Sense', 'Pattern Recognition', 'Shape and Space', 'Measurement', 'Data Handling'],
      'Science-1-5': ['Living Things', 'Materials and Matter', 'Energy and Change', 'Earth and Space', 'Scientific Inquiry'],
      'Social Studies-1-5': ['Identity and Relationships', 'Orientation in Time and Place', 'Personal Histories', 'Human Systems and Communities'],
      'Arts-1-5': ['Visual Arts', 'Music', 'Drama', 'Dance', 'Creative Expression'],
      'Physical Education-1-5': ['Movement Skills', 'Games and Sports', 'Health and Fitness', 'Safety'],
      
      // Middle Years Programme (MYP) - Grades 6-10
      'Language and Literature (English)-6-10': ['Reading and Viewing', 'Writing', 'Speaking and Listening', 'Critical Analysis', 'Creative Expression'],
      'Language Acquisition (Second Language)-6-10': ['Communication Skills', 'Cultural Understanding', 'Language Structures', 'Text Types'],
      'Individuals and Societies-6-10': ['Historical Context', 'Geographical Concepts', 'Economic Principles', 'Political Systems', 'Social Issues'],
      'Sciences-6-10': ['Living Systems', 'Chemical Interactions', 'Physical Processes', 'Earth Systems', 'Scientific Investigation'],
      'Mathematics-6-10': ['Number and Operations', 'Algebra', 'Geometry', 'Statistics and Probability', 'Mathematical Modeling'],
      'Arts-6-10': ['Visual Arts', 'Music', 'Theatre', 'Dance', 'Digital Arts'],
      'Physical and Health Education-6-10': ['Physical Activity', 'Health Promotion', 'Social Skills', 'Personal Development'],
      'Design-6-10': ['Design Process', 'Digital Design', 'Product Design', 'Engineering Design'],
      
      // Diploma Programme (DP) - Grades 11-12
      'Studies in Language and Literature-11-12': ['Literary Analysis', 'Comparative Study', 'Individual Oral', 'Higher Level Essay', 'Paper 1 and 2'],
      'Language Acquisition-11-12': ['Listening and Reading', 'Written Production', 'Interactive Skills', 'Cultural Understanding'],
      'Individuals and Societies-11-12': ['Historical Investigation', 'Economic Analysis', 'Global Politics', 'Psychology Studies', 'Environmental Systems'],
      'Sciences-11-12': ['Experimental Design', 'Data Analysis', 'Scientific Communication', 'Internal Assessment', 'Group 4 Project'],
      'Mathematics-11-12': ['Analysis and Approaches', 'Applications and Interpretation', 'Mathematical Exploration', 'Problem Solving'],
      'The Arts-11-12': ['Comparative Study', 'Process Portfolio', 'Exhibition or Performance', 'Critical Investigation']
    },

    'Cambridge IGCSE': {
      // Cambridge Primary (Grades 1-6)
      'English-1-6': ['Phonics and Reading', 'Writing Development', 'Speaking and Listening', 'Grammar and Punctuation', 'Comprehension Skills'],
      'Mathematics-1-6': ['Number Operations', 'Shape and Space', 'Measures', 'Handling Data', 'Problem Solving'],
      'Science-1-6': ['Scientific Enquiry', 'Biology Concepts', 'Chemistry Concepts', 'Physics Concepts', 'Practical Skills'],
      
      // Cambridge Lower Secondary (Grades 7-9)
      'English-7-9': ['Reading and Comprehension', 'Writing Skills', 'Speaking and Listening', 'Language Analysis', 'Literature Study'],
      'Mathematics-7-9': ['Number', 'Algebra', 'Geometry', 'Measures', 'Statistics and Probability'],
      'Science-7-9': ['Scientific Enquiry', 'Biology', 'Chemistry', 'Physics', 'Environmental Science'],
      
      // Cambridge IGCSE (Grades 9-10)
      'First Language English-9-10': ['Reading Passages', 'Directed Writing', 'Note-taking', 'Summary Writing', 'Descriptive Writing', 'Narrative Writing', 'Argumentative Writing'],
      'Mathematics-9-10': ['Number', 'Algebra', 'Coordinate Geometry', 'Geometry', 'Mensuration', 'Trigonometry', 'Statistics', 'Probability'],
      'Biology-9-10': ['Characteristics of Living Organisms', 'Organisation and Maintenance of Organisms', 'Development of Organisms and Continuity of Life', 'Relationships of Organisms with Environment'],
      'Chemistry-9-10': ['States of Matter', 'Atomic Structure', 'Chemical Bonding', 'Chemical Calculations', 'Chemical Reactions', 'Acids and Bases', 'The Periodic Table', 'Metals and Non-metals', 'Organic Chemistry'],
      'Physics-9-10': ['Motion Forces and Energy', 'Thermal Physics', 'Waves', 'Electricity and Magnetism', 'Atomic Physics'],
      'History-9-10': ['International Relations', 'Depth Studies', 'Historical Skills', 'Source Analysis'],
      'Geography-9-10': ['Population and Settlement', 'Natural Environment', 'Economic Development', 'Environmental Management'],
      'Computer Science-9-10': ['Data Representation', 'Communication', 'Hardware and Software', 'Security', 'Algorithm Design', 'Programming'],
      
      // Cambridge AS & A Levels (Grades 11-12)
      'Mathematics-11-12': ['Pure Mathematics', 'Mechanics', 'Probability and Statistics', 'Further Mathematics'],
      'Physics-11-12': ['Physical Quantities', 'Mechanics', 'Deformation of Solids', 'Waves', 'Electricity', 'Atomic Physics'],
      'Chemistry-11-12': ['Atomic Structure', 'Chemical Bonding', 'States of Matter', 'Chemical Energetics', 'Electrochemistry', 'Equilibria', 'Reaction Kinetics', 'Organic Chemistry'],
      'Biology-11-12': ['Cell Structure', 'Biological Molecules', 'Enzymes', 'Cell Membranes', 'Mitosis', 'Nucleic Acids and Protein Synthesis', 'Transport', 'Gas Exchange', 'Infectious Disease', 'Immunity']
    },

    'State Board': {
      // Primary Grades (1-5)
      'हिंदी/Regional Language-1-5': ['वर्णमाला और मात्रा', 'शब्द निर्माण', 'वाक्य रचना', 'कहानी और कविता', 'लेखन कौशल', 'व्याकरण आधार'],
      'English-1-5': ['Alphabet Learning', 'Basic Words', 'Simple Sentences', 'Reading Skills', 'Writing Practice', 'Speaking Practice'],
      'Mathematics-1-5': ['संख्या ज्ञान', 'गिनती और जोड़-घटाव', 'आकार पहचान', 'माप-तोल', 'समय और पैसा', 'सरल गुणा-भाग'],
        'Environmental Studies (पर्यावरण अध्ययन)-1-5': ['हमारा परिवार', 'हमारा घर और आस-पास', 'जानवर और पक्षी', 'पेड़-पौधे', 'भोजन और स्वास्थ्य', 'पानी और हवा', 'यातायात के साधन', 'त्योहार और परंपराएं'],
      'Arts & Crafts-1-5': ['रंग भरना और चित्र बनाना', 'कागज की कलाकृति', 'मिट्टी का काम', 'सुंदर लेखन', 'संगीत और गीत', 'नृत्य और खेल'],
      'Physical Education-1-5': ['शारीरिक व्यायाम', 'खेल-कूद', 'योग और प्राणायाम', 'स्वच्छता और स्वास्थ्य', 'सुरक्षा नियम'],
      
      // Middle Grades (6-8)
      'हिंदी-6-8': ['गद्य और काव्य', 'व्याकरण नियम', 'रचनात्मक लेखन', 'साहित्य परिचय', 'भाषा कौशल विकास'],
      'English-6-8': ['Reading Comprehension', 'Grammar and Composition', 'Literature Study', 'Creative Writing', 'Communication Skills'],
      'Mathematics-6-8': ['पूर्णांक और भिन्न', 'बीजगणित', 'ज्यामिति', 'क्षेत्रमिति', 'अनुपात समानुपात', 'सांख्यिकी'],
      'Science-6-8': ['भौतिक विज्ञान', 'रसायन विज्ञान', 'जीव विज्ञान', 'पर्यावरण विज्ञान', 'प्रयोगिक कार्य'],
      'Social Science-6-8': ['इतिहास', 'भूगोल', 'नागरिक शास्त्र', 'अर्थशास्त्र', 'सामाजिक मुद्दे'],
      'Sanskrit-6-8': ['संस्कृत व्याकरण', 'श्लोक और मंत्र', 'संस्कृत कहानियां', 'धातु और शब्द रूप'],
      
      // Secondary Grades (9-10)
      'हिंदी-9-10': ['हिंदी गद्य', 'हिंदी काव्य', 'व्याकरण और रचना', 'साहित्य इतिहास'],
      'English-9-10': ['Prose and Poetry', 'Grammar and Writing', 'Literature Analysis', 'Communication Skills'],
      'Mathematics-9-10': ['वास्तविक संख्याएं', 'बहुपद', 'द्विघात समीकरण', 'समांतर श्रेढ़ी', 'निर्देशांक ज्यामिति', 'त्रिकोणमिति', 'वृत्त', 'पृष्ठीय क्षेत्रफल', 'सांख्यिकी', 'प्रायिकता'],
      'Science-9-10': ['गति और बल', 'प्रकाश', 'विद्युत', 'आनुवंशिकता', 'प्राकृतिक संसाधन', 'हमारा पर्यावरण'],
      'Social Science-9-10': ['भारत और समकालीन विश्व', 'समकालीन भारत', 'लोकतांत्रिक राजनीति', 'आर्थिक विकास'],
      'Sanskrit-9-10': ['संस्कृत साहित्य', 'व्याकरण विस्तार', 'श्लोक अध्ययन'],

      // Higher Secondary (11-12)
      'हिंदी-11-12': ['आधुनिक हिंदी काव्य', 'हिंदी गद्य साहित्य', 'हिंदी व्याकरण', 'छंद और अलंकार', 'हिंदी साहित्य का इतिहास'],
      'English-11-12': ['English Literature', 'Grammar and Composition', 'Poetry Analysis', 'Prose Study', 'Drama Study'],
      'Physics-11-12': ['यांत्रिकी', 'तरंग गति', 'प्रकाशिकी', 'विद्युत चुम्बकत्व', 'आधुनिक भौतिकी', 'इलेक्ट्रॉनिक्स'],
      'Chemistry-11-12': ['परमाणु संरचना', 'रासायनिक आबंधन', 'अम्ल और क्षार', 'कार्बनिक रसायन', 'भौतिक रसायन', 'अकार्बनिक रसायन'],
      'Mathematics-11-12': ['फलन', 'त्रिकोणमिति', 'कलन', 'सदिश', 'त्रिविमीय ज्यामिति', 'रैखिक प्रोग्रामन', 'प्रायिकता'],
      'Biology-11-12': ['कोशिका जीव विज्ञान', 'आनुवंशिकता', 'विकास', 'पारिस्थितिकी', 'जैव प्रौद्योगिकी', 'मानव स्वास्थ्य'],
      'History-11-12': ['प्राचीन भारत', 'मध्यकालीन भारत', 'आधुनिक भारत', 'विश्व इतिहास'],
      'Geography-11-12': ['भौतिक भूगोल', 'मानव भूगोल', 'भारत का भूगोल', 'आर्थिक भूगोल'],
      'Political Science-11-12': ['राजनीतिक सिद्धांत', 'भारतीय राजनीति', 'अंतर्राष्ट्रीय संबंध', 'लोक प्रशासन'],
      'Economics-11-12': ['व्यष्टि अर्थशास्त्र', 'समष्टि अर्थशास्त्र', 'भारतीय अर्थव्यवस्था', 'आर्थिक विकास'],
      'Accountancy-11-12': ['लेखांकन के सिद्धांत', 'साझेदारी लेखे', 'कंपनी लेखे', 'वित्तीय विवरण'],
      'Business Studies-11-12': ['व्यावसायिक अध्ययन', 'प्रबंधन', 'विपणन', 'उद्यमिता'],
      'Psychology-11-12': ['मनोविज्ञान परिचय', 'संज्ञानात्मक मनोविज्ञान', 'व्यक्तित्व', 'असामान्य मनोविज्ञान'],
      'Sociology-11-12': ['समाजशास्त्र परिचय', 'सामाजिक संस्थाएं', 'सामाजिक परिवर्तन', 'भारतीय समाज'],
      'Home Science-11-12': ['पोषण विज्ञान', 'वस्त्र विज्ञान', 'गृह प्रबंधन', 'बाल विकास'],
      'Agriculture-11-12': ['फसल उत्पादन', 'मृदा विज्ञान', 'पशुपालन', 'कृषि अर्थशास्त्र'],
      'Computer Science-11-12': ['प्रोग्रामिंग', 'डेटा स्ट्रक्चर', 'कंप्यूटर नेटवर्क', 'डेटाबेस']
    }
  };

  // Grade category helper function
  const getGradeCategory = (board: string, grade: string): string => {
      const gradeNum = parseInt(grade);
      
      if (board === 'IB') {
      if (gradeNum >= 1 && gradeNum <= 5) return '1-5'; // PYP
      if (gradeNum >= 6 && gradeNum <= 10) return '6-10'; // MYP
      if (gradeNum >= 11 && gradeNum <= 12) return '11-12'; // DP
      } else if (board === 'Cambridge IGCSE') {
      if (gradeNum >= 1 && gradeNum <= 6) return '1-6'; // Cambridge Primary
      if (gradeNum >= 7 && gradeNum <= 9) return '7-9'; // Cambridge Lower Secondary
      if (gradeNum >= 9 && gradeNum <= 10) return '9-10'; // Cambridge IGCSE
      if (gradeNum >= 11 && gradeNum <= 12) return '11-12'; // Cambridge AS & A Levels
      } else {
      // CBSE, ICSE, and State Board
      if (gradeNum >= 1 && gradeNum <= 5) return '1-5';
      if (gradeNum >= 6 && gradeNum <= 8) return '6-8';
      if (gradeNum >= 9 && gradeNum <= 10) return '9-10';
      if (gradeNum >= 11 && gradeNum <= 12) return '11-12';
    }
    return '';
  };

  // UseEffect hooks for dynamic loading
  useEffect(() => {
    if (board && grade) {
      const subjectCategory = getGradeCategory(board, grade);
      const boardSubjects = subjectsByBoard[board];
      const subjects = boardSubjects && boardSubjects[subjectCategory] ? boardSubjects[subjectCategory] : [];
      setAvailableSubjects(subjects);
      setSubject('');
      setTopic('');
    }
  }, [board, grade]);

  useEffect(() => {
    if (board && grade && subject) {
      const gradeCategory = getGradeCategory(board, grade);
      const topicKey = `${subject}-${gradeCategory}`;
      const boardTopics = topicsByBoardGradeSubject[board];
      const topics = boardTopics && boardTopics[topicKey] ? boardTopics[topicKey] : [];
      setAvailableTopics(topics);
      setTopic('');
    }
  }, [board, grade, subject]);

  useEffect(() => {
    const selectedPaper = paperTypes.find(p => p.value === paperType);
    if (selectedPaper) {
      setQuestions(selectedPaper.questions);
      setFormat(selectedPaper.format);
    }
  }, [paperType]);
  // AI Question Generation Function
  const generateQuestionsWithAI = async (testConfig: any) => {
    try {
      setIsGenerating(true);
      
      const prompt = `Generate ${testConfig.questions} ${testConfig.format} questions for:
Board: ${testConfig.board}
Grade: ${testConfig.grade}
Subject: ${testConfig.subject}
Topic: ${testConfig.topic}

Format Requirements:
- Question format: ${testConfig.format}
- Include answers: ${testConfig.includeAnswers ? 'Yes' : 'No'}
- Difficulty: Appropriate for Grade ${testConfig.grade}
- Board-specific curriculum: ${testConfig.board}

For MCQ format, provide 4 options (A, B, C, D) for each question.
For Mixed format, include MCQ, short answer, and long answer questions.
For Extended format, provide detailed essay-type questions.

Please generate high-quality, curriculum-aligned questions that test understanding of ${testConfig.topic} concepts.

Respond with a JSON object in this format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "type": "MCQ/Short/Long",
      "options": ["A", "B", "C", "D"], // Only for MCQ
      "answer": "Correct answer",
      "explanation": "Brief explanation",
      "difficulty": "Easy/Medium/Hard",
      "marks": 1
    }
  ],
  "totalQuestions": ${testConfig.questions},
  "totalMarks": "calculated total",
  "timeLimit": "suggested time in minutes"
}

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON. DON'T INCLUDE LEADING BACKTICKS LIKE \`\`\`json.`;

      const response = await window.claude.complete(prompt);
      const questionsData = JSON.parse(response);
      
      const generatedTest = {
        ...testConfig,
        questionsData,
        generatedAt: new Date().toISOString()
      };
      
      setIsGenerating(false);
      onGenerateTest(generatedTest);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      setIsGenerating(false);
      
      // Fallback with sample questions
      const fallbackTest = {
        ...testConfig,
        questionsData: {
          questions: [
            {
              id: 1,
              question: `Sample question for ${testConfig.topic} - Grade ${testConfig.grade}`,
              type: testConfig.format,
              options: testConfig.format === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
              answer: 'Sample answer',
              explanation: 'This is a sample question. AI generation failed.',
              difficulty: 'Medium',
              marks: 1
            }
          ],
          totalQuestions: 1,
          totalMarks: 1,
          timeLimit: '30 minutes'
        },
        generatedAt: new Date().toISOString(),
        fallback: true
      };
      
      onGenerateTest(fallbackTest);
    }
  };

  const handleGenerateTest = () => {
    if (board && grade && subject) {
      const testConfig = {
        board,
        grade,
        subject,
        topic: topic || 'General Topics',
        paperType,
        questions: parseInt(questions),
        format,
        includeAnswers,
        timestamp: Date.now()
      };
      
      generateQuestionsWithAI(testConfig);
    }
  };

  // Styling effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mock-test-creator-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-size: 400% 400%;
        animation: gradientShift 8s ease infinite;
        padding: 20px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .mock-test-creator-back-btn {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 12px 24px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 40px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .mock-test-creator-back-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .mock-test-creator-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 24px;
        padding: 40px;
        max-width: 900px;
        margin: 0 auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      }

      .mock-test-creator-title {
        font-size: 36px;
        font-weight: 700;
        color: white;
        text-align: center;
        margin-bottom: 12px;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .mock-test-creator-subtitle {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin-bottom: 40px;
        text-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
      }

      .mock-test-creator-form {
        display: grid;
        gap: 24px;
        margin-bottom: 40px;
      }

      .mock-test-creator-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 24px;
      }

      .mock-test-creator-topic-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .mock-test-creator-form-group {
        display: flex;
        flex-direction: column;
      }

      .mock-test-creator-form-group.full-width {
        grid-column: 1 / -1;
      }

      .mock-test-creator-label {
        font-size: 16px;
        font-weight: 600;
        color: white;
        margin-bottom: 8px;
        text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
      }

      .mock-test-creator-select, .mock-test-creator-input {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 16px;
        color: white;
        font-size: 16px;
        transition: all 0.3s ease;
      }

      .mock-test-creator-select {
        appearance: none;
        cursor: pointer;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 16px center;
        background-size: 16px;
        padding-right: 48px;
      }

      .mock-test-creator-select:focus, .mock-test-creator-input:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
      }

      .mock-test-creator-select option {
        background: #4a5568;
        color: white;
        padding: 12px;
      }

      .mock-test-creator-select:disabled, .mock-test-creator-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .mock-test-creator-paper-types {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mock-test-creator-radio-group {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .mock-test-creator-radio-group:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .mock-test-creator-radio-group.selected {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
      }

      .mock-test-creator-radio {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.6);
        background: transparent;
        position: relative;
        cursor: pointer;
      }

      .mock-test-creator-radio.selected {
        border-color: #00d9ff;
        background: #00d9ff;
      }

      .mock-test-creator-radio.selected::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: white;
      }

      .mock-test-creator-radio-label {
        color: white;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
      }

      .mock-test-creator-details-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .mock-test-creator-checkbox-group {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .mock-test-creator-checkbox-group:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .mock-test-creator-checkbox {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 2px solid rgba(255, 255, 255, 0.6);
        background: transparent;
        position: relative;
        cursor: pointer;
      }

      .mock-test-creator-checkbox.checked {
        border-color: #00d9ff;
        background: #00d9ff;
      }

      .mock-test-creator-checkbox.checked::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
      }

      .mock-test-creator-checkbox-label {
        color: white;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
      }

      .mock-test-creator-button {
        background: linear-gradient(135deg, #00d9ff 0%, #0099cc 100%);
        border: none;
        border-radius: 16px;
        padding: 18px 36px;
        color: white;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 10px 30px rgba(0, 217, 255, 0.4);
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .mock-test-creator-button:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(0, 217, 255, 0.6);
      }

      .mock-test-creator-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: 0 5px 15px rgba(0, 217, 255, 0.2);
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .mock-test-creator-form-row {
          grid-template-columns: 1fr;
        }
        
        .mock-test-creator-details-row {
          grid-template-columns: 1fr;
        }
        
        .mock-test-creator-card {
          padding: 24px;
          margin: 20px;
        }
        
        .mock-test-creator-title {
          font-size: 28px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="mock-test-creator-container">
      <button className="mock-test-creator-back-btn" onClick={onBack}>
        ← Back to Dashboard
      </button>
      
      <div className="mock-test-creator-card">
        <h1 className="mock-test-creator-title">
          🎯 Mock Test Generator
        </h1>
        <p className="mock-test-creator-subtitle">
          Generate practice tests, quizzes, and puzzles for comprehensive learning across all major education boards
        </p>
        
        <div className="mock-test-creator-form">
          <div className="mock-test-creator-form-row">
            <div className="mock-test-creator-form-group">
              <label className="mock-test-creator-label">Board</label>
              <select 
                className="mock-test-creator-select"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
              >
                <option value="">Select Board</option>
                {boards.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            
            <div className="mock-test-creator-form-group">
              <label className="mock-test-creator-label">Grade</label>
              <select 
                className="mock-test-creator-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">Select Grade</option>
                {grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div className="mock-test-creator-form-group">
              <label className="mock-test-creator-label">Subject</label>
              <select 
                className="mock-test-creator-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!board || !grade}
              >
                <option value="">Select Subject</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mock-test-creator-topic-row">
            <div className="mock-test-creator-form-group">
              <label className="mock-test-creator-label">Topic</label>
              <select 
                className="mock-test-creator-select"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={!board || !grade || !subject}
              >
                <option value="">Select Topic (Optional)</option>
                {availableTopics.map(top => (
                  <option key={top} value={top}>{top}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mock-test-creator-form-group">
            <label className="mock-test-creator-label">Paper Type</label>
            <div className="mock-test-creator-paper-types">
              {paperTypes.map(paper => (
                <div
                  key={paper.value}
                  className={`mock-test-creator-radio-group ${paperType === paper.value ? 'selected' : ''}`}
                  onClick={() => setPaperType(paper.value)}
                >
                  <div className={`mock-test-creator-radio ${paperType === paper.value ? 'selected' : ''}`}></div>
                  <span className="mock-test-creator-radio-label">{paper.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mock-test-creator-details-row">
            <div className="mock-test-creator-form-group">
              <label className="mock-test-creator-label">Questions</label>
              <input 
                type="number"
                className="mock-test-creator-input"
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                min="1"
                max="100"
              />
            </div>
            
            <div className="mock-test-creator-form-group">
              <label className="mock-test-creator-label">Format</label>
              <input 
                type="text"
                className="mock-test-creator-input"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="e.g., MCQ, Mixed, Extended"
              />
            </div>
          </div>
          
          <div className="mock-test-creator-form-group">
            <div 
              className="mock-test-creator-checkbox-group"
              onClick={() => setIncludeAnswers(!includeAnswers)}
            >
              <div className={`mock-test-creator-checkbox ${includeAnswers ? 'checked' : ''}`}></div>
              <span className="mock-test-creator-checkbox-label">Include Answers</span>
            </div>
          </div>
        </div>
        
        <button 
          className="mock-test-creator-button"
          onClick={handleGenerateTest}
          disabled={!board || !grade || !subject || isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="loading-spinner"></div>
              Generating Questions...
            </>
          ) : (
            'CREATE MOCK TEST'
          )}
        </button>
      </div>
    </div>
  );
};

export default MockTestCreator;
