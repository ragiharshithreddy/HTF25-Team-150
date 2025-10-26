const Company = require('../models/Company');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Register company (Company admin self-registration)
// @route   POST /api/companies/register
// @access  Public
exports.registerCompany = asyncHandler(async (req, res) => {
  const {
    companyName,
    domain,
    description,
    website,
    industry,
    size,
    location,
    contactEmail,
    contactPhone,
    adminName,
    adminEmail,
    adminPassword
  } = req.body;
  
  // Check if company domain already exists
  const existingCompany = await Company.findOne({ domain: domain.toLowerCase() });
  if (existingCompany) {
    return res.status(400).json({
      success: false,
      message: 'Company domain already registered'
    });
  }
  
  // Check if admin email already exists
  const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already in use'
    });
  }
  
  // Create admin user first (without companyId initially)
  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'student' // Will be upgraded to 'admin' after approval
  });
  
  // Create company with adminId
  const company = await Company.create({
    name: companyName,
    domain: domain.toLowerCase(),
    description,
    website,
    industry,
    size,
    location,
    contactEmail,
    contactPhone,
    adminId: admin._id,
    status: 'pending'
  });
  
  // Update admin's companyId
  admin.companyId = company._id;
  await admin.save();
  
  res.status(201).json({
    success: true,
    message: 'Company registration submitted. Please wait for super admin approval.',
    data: {
      company: {
        id: company._id,
        name: company.name,
        domain: company.domain,
        status: company.status
      }
    }
  });
});

// @desc    Get approved companies list
// @route   GET /api/companies
// @access  Public
exports.getApprovedCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ status: 'approved' })
    .select('name domain description logo industry size location')
    .sort('name');
  
  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies
  });
});

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Public
exports.getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id)
    .select('name domain description logo website industry size location');
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  
  if (company.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Company not accessible'
    });
  }
  
  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Get open source company
// @route   GET /api/companies/opensource
// @access  Public
exports.getOpenSourceCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ isOpenSource: true, status: 'approved' })
    .select('name domain description logo');
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Open source space not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: company
  });
});

module.exports = exports;
