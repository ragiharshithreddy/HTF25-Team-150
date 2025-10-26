const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');
const Company = require('./models/Company');

const createProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongo:27017/project_allocation?authSource=admin');
    console.log('Connected to MongoDB...');

    const admin = await User.findOne({ email: 'admincosc@mail.in' });
    if (!admin) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    const company = await Company.findOne({ domain: 'cosc.in' });
    if (!company) {
      console.error('COSC company not found!');
      process.exit(1);
    }

    console.log('Found admin:', admin.email);
    console.log('Found company:', company.name);

    // Delete existing projects
    await Project.deleteMany({ companyId: company._id });
    console.log('Cleared existing projects');

    const projects = [
      {
        title: 'Student Portal Development',
        description: 'Build a modern student management portal with React and Node.js. Features include attendance tracking, grade management, and parent communication.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        category: 'web',
        difficulty: 'intermediate',
        maxTeamSize: 4,
        batch: '2024-25',
        availableRoles: [
          { role: 'Full Stack Developer', count: 2, filled: 0 },
          { role: 'Frontend Developer', count: 1, filled: 0 },
          { role: 'Backend Developer', count: 1, filled: 0 }
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        companyId: company._id,
        technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
        isFeatured: true
      },
      {
        title: 'E-Commerce Platform',
        description: 'Develop a scalable e-commerce platform with product management, shopping cart, and payment integration. Includes admin dashboard for inventory control.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'REST API', 'JavaScript'],
        category: 'web',
        difficulty: 'advanced',
        maxTeamSize: 5,
        batch: '2024-25',
        availableRoles: [
          { role: 'Full Stack Developer', count: 2, filled: 0 },
          { role: 'Frontend Developer', count: 1, filled: 0 },
          { role: 'Backend Developer', count: 1, filled: 0 },
          { role: 'UI/UX Designer', count: 1, filled: 0 }
        ],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        companyId: company._id,
        technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe'],
        isFeatured: true
      },
      {
        title: 'Machine Learning Data Analyzer',
        description: 'Create a data analysis tool using Python and ML algorithms. Includes data visualization, predictive analytics, and automated reporting.',
        requiredSkills: ['Python', 'Machine Learning', 'MongoDB'],
        category: 'data-science',
        difficulty: 'advanced',
        maxTeamSize: 3,
        batch: '2024-25',
        availableRoles: [
          { role: 'ML Engineer', count: 2, filled: 0 },
          { role: 'Data Analyst', count: 1, filled: 0 }
        ],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        companyId: company._id,
        technologies: ['Python', 'TensorFlow', 'Pandas', 'MongoDB'],
        isFeatured: false
      }
    ];

    for (const projectData of projects) {
      const project = await Project.create(projectData);
      console.log(`✓ Created project: ${project.title}`);
    }

    console.log('\n✓ All sample projects created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createProjects();
