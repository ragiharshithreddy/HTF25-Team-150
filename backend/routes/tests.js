const express = require('express');
const {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  startTest,
  submitAnswer,
  submitTest,
  reportViolation,
  getMyAttempts,
  getAllAttempts
} = require('../controllers/testsController');
const { protect, authorize, checkTestBan } = require('../middleware/auth');

const router = express.Router();

router.get('/attempts/me', protect, authorize('student'), getMyAttempts);
router.get('/attempts', protect, authorize('admin'), getAllAttempts);
router.post('/:id/start', protect, authorize('student'), checkTestBan, startTest);
router.post('/attempts/:attemptId/answer', protect, authorize('student'), submitAnswer);
router.post('/attempts/:attemptId/submit', protect, authorize('student'), submitTest);
router.post('/attempts/:attemptId/violation', protect, authorize('student'), reportViolation);

router
  .route('/')
  .get(getTests)
  .post(protect, authorize('admin'), createTest);

router
  .route('/:id')
  .get(getTest)
  .put(protect, authorize('admin'), updateTest)
  .delete(protect, authorize('admin'), deleteTest);

module.exports = router;
