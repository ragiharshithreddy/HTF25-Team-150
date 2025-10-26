const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getFeaturedProjects,
  getRecommendations,
  getProjectsByBatch,
  getProjectStats
} = require('../controllers/projectsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/featured', getFeaturedProjects);
router.get('/recommendations', protect, authorize('student'), getRecommendations);
router.get('/batch/:batch', getProjectsByBatch);
router.get('/stats', protect, authorize('admin'), getProjectStats);

router
  .route('/')
  .get(getProjects)
  .post(protect, authorize('admin'), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

module.exports = router;
