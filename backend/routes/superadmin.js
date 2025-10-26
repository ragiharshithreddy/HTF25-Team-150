const express = require('express');
const {
  getCompanies,
  getCompany,
  approveCompany,
  rejectCompany,
  suspendCompany,
  reactivateCompany,
  updateCompanySettings,
  deleteCompany,
  getSystemStats
} = require('../controllers/superadminController');
const { protect, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require superadmin auth
router.use(protect, isSuperAdmin);

router.get('/stats', getSystemStats);
router.get('/companies', getCompanies);
router.get('/companies/:id', getCompany);
router.put('/companies/:id/approve', approveCompany);
router.put('/companies/:id/reject', rejectCompany);
router.put('/companies/:id/suspend', suspendCompany);
router.put('/companies/:id/reactivate', reactivateCompany);
router.put('/companies/:id/settings', updateCompanySettings);
router.delete('/companies/:id', deleteCompany);

module.exports = router;
