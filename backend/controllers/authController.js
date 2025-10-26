const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, studentId, department, year, companyId } = req.body;

  // Validate student-specific fields
  if (role === 'student' && (!studentId || !department)) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and department are required for student registration'
    });
  }

  // Validate company selection for students
  if (role === 'student' && !companyId) {
    return res.status(400).json({
      success: false,
      message: 'Please select a company to join'
    });
  }

  // Verify company exists and is approved
  if (companyId) {
    const Company = require('../models/Company');
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Selected company not found'
      });
    }
    
    if (company.status !== 'approved' && !company.isOpenSource) {
      return res.status(400).json({
        success: false,
        message: 'Selected company is not yet approved'
      });
    }
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    studentId,
    department,
    year,
    companyId: companyId || null
  });

  // Generate token and send response
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate token and send response
  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    bio: req.body.bio,
    phone: req.body.phone,
    linkedin: req.body.linkedin,
    github: req.body.github,
    portfolio: req.body.portfolio,
    skills: req.body.skills
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'There is no user with that email'
    });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const apiResetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
  const clientBaseUrl = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.replace(/\/$/, '')
    : null;
  const browserResetUrl = clientBaseUrl
    ? `${clientBaseUrl}/reset-password/${resetToken}`
    : apiResetUrl;

  const textBody = [
    'You are receiving this email because you (or someone else) requested a password reset.',
    `Reset your password using the link below:\n${browserResetUrl}`,
    'If you did not request this change, no further action is needed.'
  ].join('\n\n');

  const htmlBody = `
    <p>You are receiving this email because you (or someone else) requested a password reset.</p>
    <p><a href="${browserResetUrl}" target="_blank" rel="noopener">Click here to reset your password</a></p>
    <p>If the button above does not work, copy and paste this URL into your browser:<br/>${browserResetUrl}</p>
    <p>If you did not request this change, you can safely ignore this email.</p>
  `.trim();

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Project Allocation password',
      text: textBody,
      html: htmlBody
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (err) {
    console.error('Failed to send reset password email:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token or token has expired'
    });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Ensure JWT_COOKIE_EXPIRE is a number (days). Default to 30 days if not set or invalid.
  const cookieExpireDays = Number(process.env.JWT_COOKIE_EXPIRE) || 30;

  const options = {
    expires: new Date(
      Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        avatar: user.avatar
      }
    });
};
