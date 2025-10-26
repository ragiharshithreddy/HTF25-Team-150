const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all students with their applications
// @route   GET /api/admin/students
// @access  Private/Admin
router.get('/students', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { search } = req.query;
  
  let query = { role: 'student' };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  
  const students = await User.find(query).select('-password').sort('-createdAt');
  
  // Fetch applications for each student
  const studentsWithApplications = await Promise.all(
    students.map(async (student) => {
      const applications = await Application.find({ studentId: student._id })
        .populate('projectId', 'title')
        .select('status preferredRole projectId createdAt');
      return {
        ...student.toObject(),
        applications
      };
    })
  );
  
  res.status(200).json({
    success: true,
    count: studentsWithApplications.length,
    data: studentsWithApplications
  });
}));

// @desc    Remove student from project
// @route   POST /api/admin/students/remove
// @access  Private/Admin
router.post('/students/remove', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { studentId, projectId, reason, details } = req.body;
  
  if (!studentId || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and reason are required'
    });
  }
  
  const student = await User.findById(studentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }
  
  // Find and update/delete the application
  const query = { studentId };
  if (projectId) {
    query.projectId = projectId;
  }
  
  const application = await Application.findOne(query).populate('projectId', 'title');
  
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }
  
  // Create notification for student
  const reasonLabels = {
    'malpractice': 'Malpractice',
    'academic_dishonesty': 'Academic Dishonesty',
    'code_of_conduct': 'Code of Conduct Violation',
    'plagiarism': 'Plagiarism',
    'cheating': 'Cheating on Tests',
    'inappropriate_behavior': 'Inappropriate Behavior',
    'non_participation': 'Non-Participation',
    'poor_performance': 'Poor Performance',
    'other': details || 'Other'
  };
  
  const reasonText = reasonLabels[reason] || reason;
  const projectTitle = application.projectId?.title || 'the project';
  
  await Notification.create({
    userId: studentId,
    title: 'Removed from Project',
    message: `You have been removed from ${projectTitle}. Reason: ${reasonText}`,
    type: 'application',
    relatedId: application._id
  });
  
  // Delete the application
  await application.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Student removed successfully'
  });
}));

router.get('/', (req, res) => res.json({ success: true, message: 'Admin route' }));

module.exports = router;

