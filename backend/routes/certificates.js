const express = require('express');
const {
  issueCertificate,
  getMyCertificates,
  getAllCertificates,
  getCertificate,
  verifyCertificate,
  revokeCertificate,
  searchByHash
} = require('../controllers/certificatesController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('admin'), issueCertificate);
router.get('/me', protect, authorize('student'), getMyCertificates);
router.get('/search/:hash', searchByHash);
router.get('/:id/verify', verifyCertificate);
router.put('/:id/revoke', protect, authorize('admin'), revokeCertificate);

router.get('/', protect, authorize('admin'), getAllCertificates);
router.get('/:id', getCertificate);

module.exports = router;
