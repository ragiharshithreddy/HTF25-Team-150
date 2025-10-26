const express = require('express');
const {
  getTemplates,
  createTemplate,
  getMyResumes,
  createResume,
  updateResume,
  deleteResume,
  analyzeResume,
  exportResume
} = require('../controllers/resumesController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/templates', getTemplates);
router.post('/templates', protect, authorize('admin'), createTemplate);
router.get('/me', protect, authorize('student'), getMyResumes);
router.get('/:id/analyze', protect, authorize('student'), analyzeResume);
router.get('/:id/export', protect, authorize('student'), exportResume);

router
  .route('/')
  .post(protect, authorize('student'), createResume);

router
  .route('/:id')
  .put(protect, authorize('student'), updateResume)
  .delete(protect, authorize('student'), deleteResume);

module.exports = router;
