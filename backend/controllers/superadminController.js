const Company = require('../models/Company');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get all companies
// @route   GET /api/superadmin/companies
// @access  Private/SuperAdmin
exports.getCompanies = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  
  let query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { domain: { $regex: search, $options: 'i' } }
    ];
  }
  
  const companies = await Company.find(query)
    .populate('adminId', 'name email')
    .populate('approvedBy', 'name email')
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies
  });
});

// @desc    Get single company
// @route   GET /api/superadmin/companies/:id
// @access  Private/SuperAdmin
exports.getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id)
    .populate('adminId', 'name email phone')
    .populate('approvedBy', 'name email');
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Approve company
// @route   PUT /api/superadmin/companies/:id/approve
// @access  Private/SuperAdmin
exports.approveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  
  if (company.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Company is already ${company.status}`
    });
  }
  
  company.status = 'approved';
  company.approvedBy = req.user.id;
  company.approvedAt = new Date();
  await company.save();
  
  // Update admin role
  await User.findByIdAndUpdate(company.adminId, { role: 'admin' });
  
  // Populate approvedBy before sending response
  await company.populate('approvedBy', 'name email');
  await company.populate('adminId', 'name email');
  
  res.status(200).json({
    success: true,
    message: 'Company approved successfully',
    data: company
  });
});

// @desc    Reject company
// @route   PUT /api/superadmin/companies/:id/reject
// @access  Private/SuperAdmin
exports.rejectCompany = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const company = await Company.findById(req.params.id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  
  if (company.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Company is already ${company.status}`
    });
  }
  
  company.status = 'rejected';
  company.rejectionReason = reason || 'Not specified';
  await company.save();
  
  // Populate before sending response
  await company.populate('adminId', 'name email');
  if (company.approvedBy) {
    await company.populate('approvedBy', 'name email');
  }
  
  res.status(200).json({
    success: true,
    message: 'Company rejected',
    data: company
  });
});

// @desc    Suspend company
// @route   PUT /api/superadmin/companies/:id/suspend
// @access  Private/SuperAdmin
exports.suspendCompany = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const company = await Company.findById(req.params.id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  
  company.status = 'suspended';
  company.rejectionReason = reason || 'Suspended by admin';
  await company.save();
  
  // Populate before sending response
  await company.populate('adminId', 'name email');
  if (company.approvedBy) {
    await company.populate('approvedBy', 'name email');
  }
  
  res.status(200).json({
    success: true,
    message: 'Company suspended',
    data: company
  });
});

// @desc    Reactivate company
// @route   PUT /api/superadmin/companies/:id/reactivate
// @access  Private/SuperAdmin
exports.reactivateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  
  company.status = 'approved';
  company.rejectionReason = undefined;
  await company.save();
  
  // Populate before sending response
  await company.populate('adminId', 'name email');
  if (company.approvedBy) {
    await company.populate('approvedBy', 'name email');
  }
  
  res.status(200).json({
    success: true,
    message: 'Company reactivated',
    data: company
  });
});

// @desc    Update company settings
// @route   PUT /api/superadmin/companies/:id/settings
// @access  Private/SuperAdmin
exports.updateCompanySettings = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  
  const { settings } = req.body;
  
  if (settings) {
    company.settings = { ...company.settings, ...settings };
    await company.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Company settings updated',
    data: company
  });
});

// @desc    Delete company
// @route   DELETE /api/superadmin/companies/:id
// @access  Private/SuperAdmin
exports.deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  
  // Check if company has active projects
  const Project = require('../models/Project');
  const projectCount = await Project.countDocuments({ companyId: company._id });
  
  if (projectCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete company with ${projectCount} active projects`
    });
  }
  
  await company.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Company deleted successfully'
  });
});

// @desc    Get system statistics
// @route   GET /api/superadmin/stats
// @access  Private/SuperAdmin
exports.getSystemStats = asyncHandler(async (req, res) => {
  const Company = require('../models/Company');
  const Project = require('../models/Project');
  const Application = require('../models/Application');
  
  const totalCompanies = await Company.countDocuments();
  const pendingCompanies = await Company.countDocuments({ status: 'pending' });
  const approvedCompanies = await Company.countDocuments({ status: 'approved' });
  const suspendedCompanies = await Company.countDocuments({ status: 'suspended' });
  
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  
  const totalProjects = await Project.countDocuments();
  const activeProjects = await Project.countDocuments({ status: 'active' });
  
  const totalApplications = await Application.countDocuments();
  const pendingApplications = await Application.countDocuments({ status: 'pending' });
  
  res.status(200).json({
    success: true,
    data: {
      companies: {
        total: totalCompanies,
        pending: pendingCompanies,
        approved: approvedCompanies,
        suspended: suspendedCompanies
      },
      users: {
        students: totalStudents,
        admins: totalAdmins
      },
      projects: {
        total: totalProjects,
        active: activeProjects
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications
      }
    }
  });
});

module.exports = exports;
