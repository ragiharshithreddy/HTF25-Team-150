const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Project = require('./models/Project');
const Application = require('./models/Application');
const { ResumeTemplate, StudentResume } = require('./models/Resume');
const SkillTest = require('./models/Test');
const TestAttempt = require('./models/TestAttempt');
const Certificate = require('./models/Certificate');
const Notification = require('./models/Notification');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...'.cyan.bold);
  } catch (err) {
    console.error(`Error: ${err.message}`.red.bold);
    process.exit(1);
  }
};

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@projecthub.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU001',
    department: 'Computer Science',
    year: 3,
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    avatar: 'https://i.pravatar.cc/150?img=12',
    reputation: 4.5
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU002',
    department: 'Computer Science',
    year: 3,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
    linkedin: 'https://linkedin.com/in/janesmith',
    github: 'https://github.com/janesmith',
    avatar: 'https://i.pravatar.cc/150?img=5',
    reputation: 4.8
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU003',
    department: 'Computer Science',
    year: 2,
    skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
    linkedin: 'https://linkedin.com/in/mikejohnson',
    github: 'https://github.com/mikejohnson',
    avatar: 'https://i.pravatar.cc/150?img=8',
    reputation: 4.2
  },
  {
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU004',
    department: 'Information Technology',
    year: 3,
    skills: ['UI/UX Design', 'Figma', 'React', 'Tailwind CSS'],
    linkedin: 'https://linkedin.com/in/sarahwilliams',
    github: 'https://github.com/sarahwilliams',
    avatar: 'https://i.pravatar.cc/150?img=9',
    reputation: 4.7
  }
];

const projects = [
  {
    title: 'E-Commerce Platform',
    description: 'Build a full-stack e-commerce platform with React, Node.js, and MongoDB. Features include product catalog, shopping cart, payment integration, and order management.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'Payment Gateway'],
    maxTeamSize: 4,
    availableRoles: [
      { role: 'Frontend Developer', count: 1, filled: 0 },
      { role: 'Backend Developer', count: 2, filled: 0 },
      { role: 'UI/UX Designer', count: 1, filled: 0 }
    ],
    batch: 'Batch A',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    status: 'active',
    difficulty: 'intermediate',
    category: 'web',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe'],
    isFeatured: true,
    tags: ['full-stack', 'e-commerce', 'payment']
  },
  {
    title: 'AI Chatbot Assistant',
    description: 'Develop an intelligent chatbot using natural language processing and machine learning. The bot should handle customer queries and provide automated responses.',
    requiredSkills: ['Python', 'NLP', 'TensorFlow', 'Flask', 'API Development'],
    maxTeamSize: 3,
    availableRoles: [
      { role: 'ML Engineer', count: 2, filled: 0 },
      { role: 'Backend Developer', count: 1, filled: 0 }
    ],
    batch: 'Batch A',
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    status: 'active',
    difficulty: 'advanced',
    category: 'ai-ml',
    technologies: ['Python', 'TensorFlow', 'NLTK', 'Flask', 'Docker'],
    isFeatured: true,
    tags: ['ai', 'nlp', 'chatbot', 'machine-learning']
  },
  {
    title: 'Social Media Dashboard',
    description: 'Create a responsive social media analytics dashboard with real-time data visualization, user management, and post scheduling features.',
    requiredSkills: ['React', 'Chart.js', 'Node.js', 'WebSocket', 'PostgreSQL'],
    maxTeamSize: 3,
    availableRoles: [
      { role: 'Frontend Developer', count: 2, filled: 0 },
      { role: 'Backend Developer', count: 1, filled: 0 }
    ],
    batch: 'Batch B',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    status: 'active',
    difficulty: 'intermediate',
    category: 'web',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Socket.IO', 'Chart.js'],
    isFeatured: false,
    tags: ['dashboard', 'analytics', 'real-time']
  },
  {
    title: 'Mobile Fitness Tracker',
    description: 'Build a cross-platform mobile app for fitness tracking with features like workout logging, calorie tracking, and progress visualization.',
    requiredSkills: ['React Native', 'Firebase', 'Mobile Development', 'UI/UX'],
    maxTeamSize: 3,
    availableRoles: [
      { role: 'Mobile Developer', count: 2, filled: 0 },
      { role: 'UI/UX Designer', count: 1, filled: 0 }
    ],
    batch: 'Batch B',
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    status: 'active',
    difficulty: 'intermediate',
    category: 'mobile',
    technologies: ['React Native', 'Firebase', 'Redux', 'Chart.js'],
    isFeatured: false,
    tags: ['mobile', 'fitness', 'health']
  },
  {
    title: 'Blockchain Voting System',
    description: 'Implement a secure blockchain-based voting system with smart contracts, ensuring transparency and immutability of votes.',
    requiredSkills: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'Smart Contracts'],
    maxTeamSize: 4,
    availableRoles: [
      { role: 'Blockchain Developer', count: 2, filled: 0 },
      { role: 'Frontend Developer', count: 1, filled: 0 },
      { role: 'Smart Contract Developer', count: 1, filled: 0 }
    ],
    batch: 'Batch C',
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    status: 'active',
    difficulty: 'advanced',
    category: 'blockchain',
    technologies: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'Hardhat'],
    isFeatured: true,
    tags: ['blockchain', 'voting', 'smart-contracts', 'decentralized']
  }
];

const skillTests = [
  {
    testId: 'TEST-FE-001',
    title: 'Frontend Developer Assessment',
    role: 'Frontend Developer',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    difficulty: 'intermediate',
    duration: 60,
    questions: [
      {
        questionId: 'Q1',
        type: 'multiple-choice',
        question: 'What is the virtual DOM in React?',
        options: [
          'A copy of the real DOM',
          'A lightweight representation of the DOM',
          'A database for storing DOM elements',
          'A testing framework'
        ],
        correctAnswer: 'A lightweight representation of the DOM',
        points: 2,
        difficulty: 'beginner',
        explanation: 'The virtual DOM is a lightweight copy of the actual DOM that React uses to optimize updates.'
      },
      {
        questionId: 'Q2',
        type: 'multiple-choice',
        question: 'Which CSS property is used for flexbox layout?',
        options: ['display: flex', 'layout: flex', 'flex-layout: true', 'position: flex'],
        correctAnswer: 'display: flex',
        points: 1,
        difficulty: 'beginner'
      },
      {
        questionId: 'Q3',
        type: 'coding',
        question: 'Write a function that returns the sum of all even numbers in an array',
        points: 5,
        difficulty: 'intermediate',
        code: {
          language: 'javascript',
          starterCode: 'function sumEvenNumbers(arr) {\n  // Your code here\n}',
          testCases: [
            { input: '[1, 2, 3, 4, 5, 6]', expectedOutput: '12', points: 2 },
            { input: '[10, 15, 20, 25]', expectedOutput: '30', points: 2 },
            { input: '[1, 3, 5, 7]', expectedOutput: '0', points: 1 }
          ]
        }
      }
    ],
    passingScore: 70,
    antiCheat: {
      enabled: true,
      monitoring: {
        networkScan: true,
        tabSwitching: true,
        screenSharing: true,
        clipboard: true,
        cameraProctoring: false
      },
      maxViolations: 3
    },
    isActive: true
  },
  {
    testId: 'TEST-BE-001',
    title: 'Backend Developer Assessment',
    role: 'Backend Developer',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST API'],
    difficulty: 'intermediate',
    duration: 90,
    questions: [
      {
        questionId: 'Q1',
        type: 'multiple-choice',
        question: 'What is middleware in Express.js?',
        options: [
          'Functions that execute during the request-response cycle',
          'Database connection handlers',
          'Frontend routing logic',
          'CSS preprocessors'
        ],
        correctAnswer: 'Functions that execute during the request-response cycle',
        points: 2,
        difficulty: 'beginner'
      },
      {
        questionId: 'Q2',
        type: 'multiple-choice',
        question: 'Which HTTP method is used to update a resource?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 'PUT',
        points: 1,
        difficulty: 'beginner'
      },
      {
        questionId: 'Q3',
        type: 'coding',
        question: 'Create an Express route that returns user data by ID',
        points: 5,
        difficulty: 'intermediate',
        code: {
          language: 'javascript',
          starterCode: 'app.get("/users/:id", (req, res) => {\n  // Your code here\n});',
          testCases: [
            { input: 'GET /users/123', expectedOutput: '{"id": "123", "name": "User"}', points: 5 }
          ]
        }
      }
    ],
    passingScore: 70,
    antiCheat: {
      enabled: true,
      monitoring: {
        networkScan: true,
        tabSwitching: true,
        screenSharing: true,
        clipboard: true,
        cameraProctoring: false
      },
      maxViolations: 3
    },
    isActive: true
  }
];

// Import data
const importData = async () => {
  try {
    console.log('Starting data import...'.yellow.bold);
    
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Application.deleteMany();
    await ResumeTemplate.deleteMany();
    await StudentResume.deleteMany();
    await SkillTest.deleteMany();
    await TestAttempt.deleteMany();
    await Certificate.deleteMany();
    await Notification.deleteMany();
    
    console.log('Existing data cleared...'.red.bold);
    
    // Insert users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`.green);
    
    // Get admin user
    const adminUser = createdUsers.find(u => u.role === 'admin');
    
    // Add admin reference to projects
    const projectsWithAdmin = projects.map(p => ({
      ...p,
      createdBy: adminUser._id
    }));
    
    // Insert projects
    const createdProjects = await Project.create(projectsWithAdmin);
    console.log(`${createdProjects.length} projects created`.green);
    
    // Add admin reference to tests
    const testsWithAdmin = skillTests.map(t => ({
      ...t,
      createdBy: adminUser._id
    }));
    
    // Insert tests
    const createdTests = await SkillTest.create(testsWithAdmin);
    console.log(`${createdTests.length} skill tests created`.green);
    
    // Create sample applications
    const studentUsers = createdUsers.filter(u => u.role === 'student');
    const sampleApplications = [];
    
    for (let i = 0; i < Math.min(3, studentUsers.length); i++) {
      for (let j = 0; j < Math.min(2, createdProjects.length); j++) {
        sampleApplications.push({
          studentId: studentUsers[i]._id,
          projectId: createdProjects[j]._id,
          preferredRole: createdProjects[j].availableRoles[0].role,
          motivation: `I am very interested in this project because it aligns with my skills and career goals. I have experience with ${createdProjects[j].requiredSkills.join(', ')} and I am eager to contribute to the team.`,
          skills: studentUsers[i].skills,
          status: i === 0 ? 'approved' : 'pending',
          availability: {
            hoursPerWeek: 20,
            startDate: new Date()
          }
        });
      }
    }
    
    if (sampleApplications.length > 0) {
      const createdApplications = await Application.create(sampleApplications);
      console.log(`${createdApplications.length} applications created`.green);
    }
    
    console.log('Data imported successfully!'.green.bold);
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`.red.bold);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    console.log('Deleting all data...'.yellow.bold);
    
    await User.deleteMany();
    await Project.deleteMany();
    await Application.deleteMany();
    await ResumeTemplate.deleteMany();
    await StudentResume.deleteMany();
    await SkillTest.deleteMany();
    await TestAttempt.deleteMany();
    await Certificate.deleteMany();
    await Notification.deleteMany();
    
    console.log('Data deleted successfully!'.red.bold);
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`.red.bold);
    process.exit(1);
  }
};

// Run seeder
if (process.argv[2] === '-i') {
  connectDB().then(() => importData());
} else if (process.argv[2] === '-d') {
  connectDB().then(() => deleteData());
} else {
  console.log('Please specify -i to import or -d to delete data'.yellow);
  process.exit(0);
}
