const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Company = require('./models/Company');

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

const initializeSuperAdmin = async () => {
  try {
    await connectDB();
    
    // Check if super admin exists
    const existingSuperAdmin = await User.findOne({ email: 'pbsr@admin.pvt' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists'.yellow);
      return;
    }
    
    // Create super admin
    const superAdmin = await User.create({
      name: 'PBSR Super Admin',
      email: 'pbsr@admin.pvt',
      password: 'adminpbsr',
      role: 'superadmin',
      isSuperAdmin: true
    });
    
    console.log('Super admin created successfully!'.green.bold);
    console.log(`Email: pbsr@admin.pvt`.cyan);
    console.log(`Password: adminpbsr`.cyan);
    
    // Check if open source company exists
    const existingOpenSource = await Company.findOne({ isOpenSource: true });
    
    if (existingOpenSource) {
      console.log('Open source company already exists'.yellow);
      process.exit(0);
    }
    
    // Create open source company admin user
    const osAdmin = await User.create({
      name: 'Open Source Admin',
      email: 'opensource@pbsr.org',
      password: 'opensource123',
      role: 'admin'
    });
    
    // Create open source company
    const openSourceCompany = await Company.create({
      name: 'Open Source Community',
      domain: 'opensource.pbsr.org',
      description: 'A community-driven space for open source projects. Everyone is welcome to join and collaborate!',
      logo: '',
      website: 'https://opensource.pbsr.org',
      industry: 'technology',
      size: '1000+',
      location: 'Global',
      contactEmail: 'opensource@pbsr.org',
      contactPhone: '',
      adminId: osAdmin._id,
      status: 'approved',
      isOpenSource: true,
      settings: {
        allowPublicProjects: true,
        requireApproval: false,
        maxProjects: 1000,
        maxAdmins: 10
      },
      approvedBy: superAdmin._id,
      approvedAt: new Date()
    });
    
    // Update open source admin's companyId
    osAdmin.companyId = openSourceCompany._id;
    await osAdmin.save();
    
    console.log('Open Source Company created successfully!'.green.bold);
    console.log(`Company: ${openSourceCompany.name}`.cyan);
    console.log(`Domain: ${openSourceCompany.domain}`.cyan);
    console.log(`Admin Email: opensource@pbsr.org`.cyan);
    console.log(`Admin Password: opensource123`.cyan);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initializeSuperAdmin();
}

module.exports = initializeSuperAdmin;
