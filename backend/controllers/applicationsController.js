const Application = require('../models/Application');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private/Admin
exports.getApplications = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Application.find(JSON.parse(queryStr))
    .populate('studentId', 'name email avatar studentId department year skills')
    .populate('projectId', 'title batch requiredSkills maxTeamSize');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Application.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const applications = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    pagination,
    data: applications
  });
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('studentId', 'name email avatar studentId department year skills linkedin github')
    .populate('projectId', 'title description batch requiredSkills maxTeamSize availableRoles');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check ownership (student can only see their own, admin can see all)
  if (req.user.role !== 'admin' && application.studentId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this application'
    });
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private/Student
exports.createApplication = asyncHandler(async (req, res, next) => {
  const { projectId, preferredRole, motivation, availability } = req.body;

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Check if project is active
  if (project.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Project is not accepting applications'
    });
  }

  // Check if deadline has passed
  if (new Date() > project.deadline) {
    return res.status(400).json({
      success: false,
      message: 'Application deadline has passed'
    });
  }

  // Check if student already applied
  const existingApplication = await Application.findOne({
    studentId: req.user.id,
    projectId
  });

  if (existingApplication) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied to this project',
      application: existingApplication
    });
  }

  // Check if preferred role exists and has available slots
  const roleInfo = project.availableRoles.find(r => r.role === preferredRole);
  if (!roleInfo) {
    return res.status(400).json({
      success: false,
      message: 'Preferred role not found in project'
    });
  }

  if (roleInfo.filled >= roleInfo.count) {
    return res.status(400).json({
      success: false,
      message: 'No available slots for this role'
    });
  }

  // Get student info
  const student = await User.findById(req.user.id);

  // Create application
  const application = await Application.create({
    studentId: req.user.id,
    projectId,
    preferredRole,
    motivation,
    skills: student.skills || [],
    availability,
    status: 'pending'
  });

  // Populate the created application
  await application.populate('projectId', 'title batch');

  // Create notification for admin
  await Notification.create({
    userId: project.createdBy,
    type: 'application',
    title: 'New Project Application',
    message: `${student.name} applied for ${preferredRole} role in ${project.title}`,
    relatedId: application._id,
    relatedModel: 'Application'
  });

  res.status(201).json({
    success: true,
    data: application
  });
});

// @desc    Update application (student can update pending applications)
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = asyncHandler(async (req, res, next) => {
  let application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check ownership
  if (application.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this application'
    });
  }

  // Students can only update pending applications
  if (req.user.role === 'student' && application.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update application that is not pending'
    });
  }

  // Update allowed fields
  const allowedFields = ['motivation', 'availability', 'preferredRole'];
  const updates = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  application = await Application.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('projectId', 'title batch');

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private/Student
exports.withdrawApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check ownership
  if (application.studentId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to withdraw this application'
    });
  }

  // Can only withdraw pending or shortlisted applications
  if (!['pending', 'shortlisted'].includes(application.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot withdraw application with current status'
    });
  }

  await application.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Application withdrawn successfully'
  });
});

// @desc    Get my applications (for logged-in student)
// @route   GET /api/applications/me/all
// @access  Private/Student
exports.getMyApplications = asyncHandler(async (req, res, next) => {
  const applications = await Application.find({ studentId: req.user.id })
    .populate('projectId', 'title description batch requiredSkills maxTeamSize deadline status')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc    Get applications for a specific project
// @route   GET /api/applications/project/:projectId
// @access  Private/Admin
exports.getProjectApplications = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { status } = req.query;

  // Build query
  const query = { projectId };
  if (status) {
    query.status = status;
  }

  const applications = await Application.find(query)
    .populate('studentId', 'name email avatar studentId department year skills reputation linkedin github')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc    Approve application (Admin only)
// @route   PUT /api/applications/:id/approve
// @access  Private/Admin
exports.approveApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('projectId', 'title batch availableRoles team maxTeamSize');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  if (application.status !== 'shortlisted' && application.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending or shortlisted applications can be approved'
    });
  }

  // Check if project has available slots
  const project = application.projectId;
  if (project.team.length >= project.maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: 'Project team is full'
    });
  }

  // Check role availability
  const roleInfo = project.availableRoles.find(r => r.role === application.preferredRole);
  if (!roleInfo || roleInfo.filled >= roleInfo.count) {
    return res.status(400).json({
      success: false,
      message: 'No available slots for this role'
    });
  }

  // Update application status
  application.status = 'approved';
  application.approvedBy = req.user.id;
  application.approvedAt = Date.now();
  await application.save();

  // Create notification for student
  await Notification.create({
    userId: application.studentId._id,
    type: 'application',
    title: 'Application Approved! 🎉',
    message: `Your application for ${application.preferredRole} in ${project.title} has been approved!`,
    relatedId: application._id,
    relatedModel: 'Application',
    priority: 'high'
  });

  res.status(200).json({
    success: true,
    data: application,
    message: 'Application approved successfully'
  });
});

// @desc    Reject application (Admin only)
// @route   PUT /api/applications/:id/reject
// @access  Private/Admin
exports.rejectApplication = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('projectId', 'title');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  if (application.status === 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Cannot reject an approved application'
    });
  }

  application.status = 'rejected';
  application.rejectionReason = reason;
  await application.save();

  // Create notification for student
  await Notification.create({
    userId: application.studentId._id,
    type: 'application',
    title: 'Application Update',
    message: `Your application for ${application.projectId.title} was not selected this time.`,
    relatedId: application._id,
    relatedModel: 'Application'
  });

  res.status(200).json({
    success: true,
    data: application,
    message: 'Application rejected'
  });
});

// @desc    Shortlist application (Admin only)
// @route   PUT /api/applications/:id/shortlist
// @access  Private/Admin
exports.shortlistApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('projectId', 'title');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  if (application.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending applications can be shortlisted'
    });
  }

  application.status = 'shortlisted';
  await application.save();

  // Create notification for student
  await Notification.create({
    userId: application.studentId._id,
    type: 'application',
    title: 'Application Shortlisted! ⭐',
    message: `You have been shortlisted for ${application.projectId.title}. Interview details will be shared soon.`,
    relatedId: application._id,
    relatedModel: 'Application',
    priority: 'high'
  });

  res.status(200).json({
    success: true,
    data: application,
    message: 'Application shortlisted successfully'
  });
});

// @desc    Schedule interview (Admin only)
// @route   PUT /api/applications/:id/interview
// @access  Private/Admin
exports.scheduleInterview = asyncHandler(async (req, res, next) => {
  const { scheduledDate, interviewMode, meetingLink, notes } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('projectId', 'title');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  if (application.status !== 'shortlisted') {
    return res.status(400).json({
      success: false,
      message: 'Only shortlisted applications can have interviews scheduled'
    });
  }

  application.interview = {
    scheduled: true,
    scheduledDate: new Date(scheduledDate),
    interviewMode,
    meetingLink,
    notes
  };

  await application.save();

  // Create notification for student
  await Notification.create({
    userId: application.studentId._id,
    type: 'interview',
    title: 'Interview Scheduled! 📅',
    message: `Your interview for ${application.projectId.title} is scheduled for ${new Date(scheduledDate).toLocaleString()}`,
    relatedId: application._id,
    relatedModel: 'Application',
    priority: 'high'
  });

  res.status(200).json({
    success: true,
    data: application,
    message: 'Interview scheduled successfully'
  });
});

// @desc    Get application statistics
// @route   GET /api/applications/stats/overview
// @access  Private/Admin
exports.getApplicationStats = asyncHandler(async (req, res, next) => {
  const statusStats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const projectStats = await Application.aggregate([
    {
      $group: {
        _id: '$projectId',
        applicationCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'project'
      }
    },
    {
      $unwind: '$project'
    },
    {
      $project: {
        projectTitle: '$project.title',
        applicationCount: 1
      }
    },
    {
      $sort: { applicationCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  const total = await Application.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      total,
      statusStats,
      topProjects: projectStats
    }
  });
});
