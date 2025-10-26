const Certificate = require('../models/Certificate');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');

// Simulate blockchain transaction
const simulateBlockchainMint = async (certificateData) => {
  // In production, this would call actual blockchain using ethers.js
  return {
    transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
    blockNumber: Math.floor(Math.random() * 1000000) + 1,
    contractAddress: '0x' + crypto.randomBytes(20).toString('hex'),
    tokenId: Math.floor(Math.random() * 100000) + 1
  };
};

// Simulate IPFS upload
const simulateIPFSUpload = async (metadata) => {
  // In production, this would upload to IPFS using ipfs-http-client
  return 'Qm' + crypto.randomBytes(32).toString('base58').substring(0, 44);
};

// @desc    Issue certificate (Admin)
// @route   POST /api/certificates
// @access  Private/Admin
exports.issueCertificate = asyncHandler(async (req, res) => {
  const { recipientId, type, title, description, projectId, skills, metadata } = req.body;

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({ success: false, message: 'Recipient not found' });
  }

  // Generate certificate hash
  const certificateData = {
    recipientId,
    recipientName: recipient.name,
    recipientEmail: recipient.email,
    type,
    title,
    description,
    skills,
    issuedAt: new Date(),
    issuedBy: req.user.id
  };

  const dataString = JSON.stringify(certificateData);
  const hash = crypto.createHash('sha256').update(dataString).digest('hex');

  // Simulate blockchain minting
  const blockchain = await simulateBlockchainMint(certificateData);

  // Simulate IPFS upload
  const ipfsHash = await simulateIPFSUpload({
    ...certificateData,
    blockchain
  });

  // Create certificate
  const certificate = await Certificate.create({
    recipientId,
    recipientName: recipient.name,
    recipientEmail: recipient.email,
    type,
    title,
    description,
    projectId,
    skills: skills || [],
    issuedBy: req.user.id,
    certificateHash: hash,
    blockchain: {
      transactionHash: blockchain.transactionHash,
      blockNumber: blockchain.blockNumber,
      contractAddress: blockchain.contractAddress,
      tokenId: blockchain.tokenId,
      network: process.env.BLOCKCHAIN_NETWORK || 'polygon-mumbai'
    },
    ipfs: {
      hash: ipfsHash,
      url: `https://ipfs.io/ipfs/${ipfsHash}`
    },
    metadata: metadata || {},
    signature: {
      algorithm: 'SHA256',
      value: hash,
      signedBy: req.user.id,
      signedAt: new Date()
    }
  });

  res.status(201).json({
    success: true,
    data: certificate,
    message: 'Certificate issued successfully'
  });
});

// @desc    Get my certificates
// @route   GET /api/certificates/me
// @access  Private/Student
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ recipientId: req.user.id })
    .populate('issuedBy', 'name email')
    .populate('projectId', 'title')
    .sort('-issuedAt');

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});

// @desc    Get all certificates (Admin)
// @route   GET /api/certificates
// @access  Private/Admin
exports.getAllCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find()
    .populate('recipientId', 'name email studentId')
    .populate('issuedBy', 'name email')
    .populate('projectId', 'title')
    .sort('-issuedAt');

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Public
exports.getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('issuedBy', 'name email')
    .populate('projectId', 'title description');

  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }

  res.status(200).json({
    success: true,
    data: certificate
  });
});

// @desc    Verify certificate
// @route   GET /api/certificates/:id/verify
// @access  Public
exports.verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    return res.status(404).json({
      success: false,
      verified: false,
      message: 'Certificate not found'
    });
  }

  // Check if revoked
  if (certificate.revoked) {
    return res.status(200).json({
      success: true,
      verified: false,
      message: 'Certificate has been revoked',
      revokedAt: certificate.revokedAt,
      revokedReason: certificate.revokedReason
    });
  }

  // Verify integrity
  const isValid = certificate.verifyIntegrity();

  res.status(200).json({
    success: true,
    verified: isValid && !certificate.revoked,
    data: {
      certificateId: certificate._id,
      recipientName: certificate.recipientName,
      title: certificate.title,
      issuedAt: certificate.issuedAt,
      blockchain: certificate.blockchain,
      ipfs: certificate.ipfs
    }
  });
});

// @desc    Revoke certificate (Admin)
// @route   PUT /api/certificates/:id/revoke
// @access  Private/Admin
exports.revokeCertificate = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }

  if (certificate.revoked) {
    return res.status(400).json({ success: false, message: 'Certificate already revoked' });
  }

  certificate.revoked = true;
  certificate.revokedAt = new Date();
  certificate.revokedBy = req.user.id;
  certificate.revokedReason = reason || 'Administrative action';

  await certificate.save();

  res.status(200).json({
    success: true,
    message: 'Certificate revoked successfully',
    data: certificate
  });
});

// @desc    Search certificates by hash
// @route   GET /api/certificates/search/:hash
// @access  Public
exports.searchByHash = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateHash: req.params.hash })
    .populate('issuedBy', 'name email');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'No certificate found with this hash'
    });
  }

  res.status(200).json({
    success: true,
    data: certificate
  });
});

module.exports = exports;
