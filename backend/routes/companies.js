const express = require('express');
const {
  registerCompany,
  getApprovedCompanies,
  getCompanyById,
  getOpenSourceCompany
} = require('../controllers/companiesController');

const router = express.Router();

router.post('/register', registerCompany);
router.get('/', getApprovedCompanies);
router.get('/opensource', getOpenSourceCompany);
router.get('/:id', getCompanyById);

module.exports = router;
