const express = require('express');
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  withdrawApplication,
  getMyApplications,
  getProjectApplications,
  approveApplication,
  rejectApplication,
  shortlistApplication,
  scheduleInterview,
  getApplicationStats
} = require('../controllers/applicationsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.get('/me/all', protect, authorize('student'), getMyApplications);
router.post('/', protect, authorize('student'), createApplication);
router.put('/:id', protect, updateApplication);
router.delete('/:id', protect, authorize('student'), withdrawApplication);

// Admin routes
router.get('/', protect, authorize('admin'), getApplications);
router.get('/stats/overview', protect, authorize('admin'), getApplicationStats);
router.get('/project/:projectId', protect, authorize('admin'), getProjectApplications);
router.put('/:id/approve', protect, authorize('admin'), approveApplication);
router.put('/:id/reject', protect, authorize('admin'), rejectApplication);
router.put('/:id/shortlist', protect, authorize('admin'), shortlistApplication);
router.put('/:id/interview', protect, authorize('admin'), scheduleInterview);

// Shared routes
router.get('/:id', protect, getApplication);

module.exports = router;

