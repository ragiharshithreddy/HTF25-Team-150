const Project = require('../models/Project');
const Application = require('../models/Application');
const asyncHandler = require('../middleware/async');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', 'companyId'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string with operators ($gt, $gte, etc.)
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Parse query
  const parsedQuery = JSON.parse(queryStr);
  
  // Add company filter if provided or use user's company
  if (req.query.companyId) {
    parsedQuery.companyId = req.query.companyId;
  } else if (req.user && req.user.companyId) {
    parsedQuery.companyId = req.user.companyId;
  }

  // Finding resource
  let query = Project.find(parsedQuery)
    .populate('createdBy', 'name email')
    .populate('companyId', 'name domain logo');

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
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Project.countDocuments(parsedQuery);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const projects = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    pagination,
    data: projects
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('team.studentId', 'name email avatar studentId department');

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = asyncHandler(async (req, res, next) => {
  // Add user and company to req.body
  req.body.createdBy = req.user.id;
  req.body.companyId = req.user.companyId;

  const project = await Project.create(req.body);

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Make sure user is project creator or admin
  if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this project'
    });
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Make sure user is project creator or admin
  if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this project'
    });
  }

  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
exports.getFeaturedProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ isFeatured: true, status: 'active' })
    .populate('createdBy', 'name email')
    .sort('-createdAt')
    .limit(6);

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get project recommendations for student
// @route   GET /api/projects/recommendations
// @access  Private/Student
exports.getRecommendations = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Simple skill-based matching algorithm
  const projects = await Project.find({ status: 'active' });

  const recommendations = projects.map(project => {
    // Calculate skill match percentage
    const userSkills = user.skills || [];
    const projectSkills = project.requiredSkills || [];
    
    const matchingSkills = userSkills.filter(skill => 
      projectSkills.some(pSkill => pSkill.toLowerCase() === skill.toLowerCase())
    );
    
    const matchPercentage = projectSkills.length > 0 
      ? Math.round((matchingSkills.length / projectSkills.length) * 100)
      : 0;

    return {
      project,
      matchPercentage,
      matchingSkills
    };
  })
  .filter(rec => rec.matchPercentage > 0)
  .sort((a, b) => b.matchPercentage - a.matchPercentage)
  .slice(0, 10);

  res.status(200).json({
    success: true,
    count: recommendations.length,
    data: recommendations
  });
});

// @desc    Get projects by batch
// @route   GET /api/projects/batch/:batch
// @access  Public
exports.getProjectsByBatch = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ batch: req.params.batch })
    .populate('createdBy', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private/Admin
exports.getProjectStats = asyncHandler(async (req, res, next) => {
  const stats = await Project.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgTeamSize: { $avg: '$maxTeamSize' }
      }
    }
  ]);

  const categoryStats = await Project.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  const difficultyStats = await Project.aggregate([
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      statusStats: stats,
      categoryStats,
      difficultyStats
    }
  });
});
