const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./async');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: err.message
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is super admin
exports.isSuperAdmin = async (req, res, next) => {
  if (!req.user.isSuperAdmin || req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

// Check company access (for multi-tenancy)
exports.checkCompanyAccess = asyncHandler(async (req, res, next) => {
  // Super admin can access all companies
  if (req.user.role === 'superadmin') {
    return next();
  }
  
  const Company = require('../models/Company');
  const userCompany = await Company.findById(req.user.companyId);
  
  if (!userCompany) {
    return res.status(403).json({
      success: false,
      message: 'Company not found or not approved'
    });
  }
  
  if (userCompany.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Company is not approved. Please wait for admin approval.'
    });
  }
  
  req.company = userCompany;
  next();
});

// Check if user is banned from taking tests
exports.checkTestBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.testBan && user.testBan.isActive) {
      const timeRemaining = user.testBan.expiresAt - Date.now();
      
      if (timeRemaining > 0) {
        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        
        return res.status(403).json({
          success: false,
          message: `You are banned from taking tests`,
          ban: {
            reason: user.testBan.reason,
            expiresAt: user.testBan.expiresAt,
            daysRemaining
          }
        });
      } else {
        // Ban has expired, clear it
        user.testBan.isActive = false;
        await user.save();
      }
    }

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error checking test ban status',
      error: err.message
    });
  }
};

// Ownership check for resources
exports.checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user owns the resource or is admin
      const isOwner = 
        resource.studentId?.toString() === req.user.id ||
        resource.userId?.toString() === req.user.id ||
        resource.createdBy?.toString() === req.user.id;

      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Error checking ownership',
        error: err.message
      });
    }
  };
};
