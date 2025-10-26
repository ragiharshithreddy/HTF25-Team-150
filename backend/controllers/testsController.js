const SkillTest = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Public
exports.getTests = asyncHandler(async (req, res) => {
  const tests = await SkillTest.find({ isActive: true })
    .select('-questions.correctAnswer')
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    count: tests.length,
    data: tests
  });
});

// @desc    Get single test
// @route   GET /api/tests/:id
// @access  Public
exports.getTest = asyncHandler(async (req, res) => {
  const test = await SkillTest.findById(req.params.id)
    .select('-questions.correctAnswer')
    .populate('createdBy', 'name email');

  if (!test) {
    return res.status(404).json({ success: false, message: 'Test not found' });
  }

  res.status(200).json({ success: true, data: test });
});

// @desc    Create test (Admin)
// @route   POST /api/tests
// @access  Private/Admin
exports.createTest = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  const test = await SkillTest.create(req.body);

  res.status(201).json({ success: true, data: test });
});

// @desc    Update test (Admin)
// @route   PUT /api/tests/:id
// @access  Private/Admin
exports.updateTest = asyncHandler(async (req, res) => {
  const test = await SkillTest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!test) {
    return res.status(404).json({ success: false, message: 'Test not found' });
  }

  res.status(200).json({ success: true, data: test });
});

// @desc    Delete test (Admin)
// @route   DELETE /api/tests/:id
// @access  Private/Admin
exports.deleteTest = asyncHandler(async (req, res) => {
  const test = await SkillTest.findByIdAndDelete(req.params.id);

  if (!test) {
    return res.status(404).json({ success: false, message: 'Test not found' });
  }

  res.status(200).json({ success: true, message: 'Test deleted' });
});

// @desc    Start test attempt
// @route   POST /api/tests/:id/start
// @access  Private/Student
exports.startTest = asyncHandler(async (req, res) => {
  const test = await SkillTest.findById(req.params.id);

  if (!test || !test.isActive) {
    return res.status(404).json({ success: false, message: 'Test not available' });
  }

  // Check existing attempts
  const existingAttempts = await TestAttempt.find({
    studentId: req.user.id,
    testId: req.params.id
  });

  const passedAttempt = existingAttempts.find(a => a.hasPassed());
  if (passedAttempt) {
    return res.status(400).json({
      success: false,
      message: 'You have already passed this test'
    });
  }

  // Create new attempt
  const attempt = await TestAttempt.create({
    studentId: req.user.id,
    testId: req.params.id,
    startTime: new Date(),
    answers: [],
    violations: []
  });

  // Return test with questions but without correct answers
  const testData = test.toObject();
  testData.questions = testData.questions.map(q => {
    const { correctAnswer, explanation, ...rest } = q;
    return rest;
  });

  res.status(201).json({
    success: true,
    data: {
      attempt: attempt._id,
      test: testData,
      duration: test.duration
    }
  });
});

// @desc    Submit test answer
// @route   POST /api/tests/attempts/:attemptId/answer
// @access  Private/Student
exports.submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, answer } = req.body;
  
  const attempt = await TestAttempt.findById(req.params.attemptId);

  if (!attempt) {
    return res.status(404).json({ success: false, message: 'Attempt not found' });
  }

  if (attempt.studentId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (attempt.submittedAt) {
    return res.status(400).json({ success: false, message: 'Test already submitted' });
  }

  // Add/update answer
  const existingIndex = attempt.answers.findIndex(a => a.questionId === questionId);
  if (existingIndex >= 0) {
    attempt.answers[existingIndex].answer = answer;
  } else {
    attempt.answers.push({ questionId, answer });
  }

  await attempt.save();

  res.status(200).json({ success: true, message: 'Answer saved' });
});

// @desc    Submit test
// @route   POST /api/tests/attempts/:attemptId/submit
// @access  Private/Student
exports.submitTest = asyncHandler(async (req, res) => {
  const attempt = await TestAttempt.findById(req.params.attemptId).populate('testId');

  if (!attempt) {
    return res.status(404).json({ success: false, message: 'Attempt not found' });
  }

  if (attempt.studentId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (attempt.submittedAt) {
    return res.status(400).json({ success: false, message: 'Test already submitted' });
  }

  attempt.submittedAt = new Date();
  await attempt.save();

  res.status(200).json({
    success: true,
    data: {
      score: attempt.score,
      percentage: attempt.percentage,
      grade: attempt.grade,
      passed: attempt.hasPassed()
    }
  });
});

// @desc    Report violation
// @route   POST /api/tests/attempts/:attemptId/violation
// @access  Private/Student
exports.reportViolation = asyncHandler(async (req, res) => {
  const { type, details } = req.body;
  
  const attempt = await TestAttempt.findById(req.params.attemptId).populate('testId');

  if (!attempt) {
    return res.status(404).json({ success: false, message: 'Attempt not found' });
  }

  attempt.violations.push({
    type,
    timestamp: new Date(),
    details
  });

  await attempt.save();

  // Emit socket event
  const io = req.app.get('io');
  io.to(req.params.attemptId).emit('anti-cheat-warning', {
    violationCount: attempt.violations.length,
    type,
    warning: attempt.violations.length >= (attempt.testId.antiCheat?.maxViolations || 3)
  });

  res.status(200).json({
    success: true,
    violationCount: attempt.violations.length,
    maxViolations: attempt.testId.antiCheat?.maxViolations || 3
  });
});

// @desc    Get test attempts (Student)
// @route   GET /api/tests/attempts/me
// @access  Private/Student
exports.getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({ studentId: req.user.id })
    .populate('testId', 'title role skills difficulty passingScore')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts
  });
});

// @desc    Get all attempts (Admin)
// @route   GET /api/tests/attempts
// @access  Private/Admin
exports.getAllAttempts = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find()
    .populate('studentId', 'name email studentId')
    .populate('testId', 'title role')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts
  });
});

module.exports = exports;
