const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config();

const Company = require('./models/Company');
const User = require('./models/User');

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

const setupCOSC = async () => {
  try {
    await connectDB();
    
    // Find super admin
    const superAdmin = await User.findOne({ isSuperAdmin: true });
    if (!superAdmin) {
      console.log('Creating super admin first...'.yellow);
      const newSuperAdmin = await User.create({
        name: 'PBSR Super Admin',
        email: 'pbsr@admin.pvt',
        password: 'adminpbsr',
        role: 'superadmin',
        isSuperAdmin: true
      });
      console.log('Super Admin Created'.green);
    }
    
    const admin = await User.findOne({ isSuperAdmin: true });
    
    // Check if COSC company exists
    let coscCompany = await Company.findOne({ domain: 'cosc.in' });
    let adminUser = await User.findOne({ email: 'admincosc@mail.in' });
    
    if (!coscCompany) {
      // Need to create a placeholder admin first to satisfy company requirements
      if (!adminUser) {
        // Create temp student role to bypass companyId requirement initially
        adminUser = new User({
          name: 'COSC Admin',
          email: 'admincosc@mail.in',
          password: 'admincosc',
          role: 'student',
          isSuperAdmin: false,
          companyId: new mongoose.Types.ObjectId() // Temporary
        });
      }
      
      // Create COSC company
      coscCompany = await Company.create({
        name: 'COSC',
        domain: 'cosc.in',
        description: 'Computer Science Department',
        contactEmail: 'contact@cosc.in',
        adminId: adminUser._id || new mongoose.Types.ObjectId(),
        status: 'approved',
        isOpenSource: false,
        approvedBy: admin._id,
        approvedAt: new Date()
      });
      console.log('COSC Company Created'.green.bold);
      
      // Now update admin with correct info and save
      adminUser.companyId = coscCompany._id;
      adminUser.role = 'admin';
      await adminUser.save();
      
      // Update company with correct adminId
      coscCompany.adminId = adminUser._id;
      await coscCompany.save();
      
      console.log('✓ Admin Created: admincosc@mail.in / admincosc'.green);
    } else {
      console.log('COSC Company already exists'.yellow);
      if (adminUser) {
        adminUser.companyId = coscCompany._id;
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('✓ Admin Updated: admincosc@mail.in'.yellow);
      }
    }
    
    // Create/update student user
    let studentUser = await User.findOne({ email: 'stu1@cosc.in' });
    if (!studentUser) {
      // Check if studentId is already taken
      const existingStudent = await User.findOne({ studentId: 'STU001' });
      if (existingStudent) {
        console.log('⚠ StudentId STU001 already exists, using different ID'.yellow);
      }
      
      studentUser = await User.create({
        name: 'Student One',
        email: 'stu1@cosc.in',
        password: 'stu1pass',
        role: 'student',
        studentId: existingStudent ? 'COSC001' : 'STU001',
        department: 'Computer Science',
        year: 3,
        companyId: coscCompany._id
      });
      console.log('✓ Student Created: stu1@cosc.in / stu1pass'.green);
    } else {
      studentUser.companyId = coscCompany._id;
      if (!studentUser.studentId) {
        studentUser.studentId = 'COSC001';
      }
      await studentUser.save();
      console.log('✓ Student Updated: stu1@cosc.in'.yellow);
    }
    
    // Ensure Open Source company exists
    let osCompany = await Company.findOne({ isOpenSource: true });
    if (!osCompany) {
      osCompany = await Company.create({
        name: 'Open Source Community',
        domain: 'opensource.pbsr.org',
        description: 'Public open source projects - everyone welcome!',
        contactEmail: 'opensource@pbsr.org',
        adminId: admin._id,
        status: 'approved',
        isOpenSource: true,
        approvedBy: admin._id,
        approvedAt: new Date()
      });
      console.log('✓ Open Source Company Created'.green);
    }
    
    console.log('\n=== CREDENTIALS ==='.cyan.bold);
    console.log('Super Admin:');
    console.log('  Email: pbsr@admin.pvt');
    console.log('  Password: adminpbsr\n');
    console.log('COSC Admin:');
    console.log('  Email: admincosc@mail.in');
    console.log('  Password: admincosc\n');
    console.log('COSC Student:');
    console.log('  Email: stu1@cosc.in');
    console.log('  Password: stu1pass\n');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

setupCOSC();
