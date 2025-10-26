const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  certificateHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  testAttemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestAttempt'
  },
  type: {
    type: String,
    enum: ['project-completion', 'skill-test', 'course-completion', 'achievement'],
    required: true
  },
  metadata: {
    studentName: String,
    studentEmail: String,
    studentId: String,
    projectTitle: String,
    projectDescription: String,
    role: String,
    batch: String,
    completionDate: Date,
    duration: String,
    skillsVerified: [String],
    grade: String,
    score: Number,
    peerReviews: [{
      reviewerId: mongoose.Schema.Types.ObjectId,
      reviewerName: String,
      rating: Number,
      comment: String
    }],
    adminApproval: {
      approvedBy: mongoose.Schema.Types.ObjectId,
      approverName: String,
      approvalDate: Date,
      comments: String
    }
  },
  blockchain: {
    network: {
      type: String,
      default: 'polygon-mumbai'
    },
    contractAddress: String,
    transactionHash: String,
    blockNumber: Number,
    timestamp: Number,
    gasUsed: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  ipfs: {
    hash: String,
    url: String,
    pinned: {
      type: Boolean,
      default: false
    }
  },
  signatures: {
    platform: {
      signature: String,
      publicKey: String,
      algorithm: String,
      timestamp: Number
    },
    admin: {
      signature: String,
      adminId: mongoose.Schema.Types.ObjectId,
      publicKey: String,
      timestamp: Number
    },
    peers: [{
      signature: String,
      peerId: mongoose.Schema.Types.ObjectId,
      peerName: String,
      timestamp: Number
    }]
  },
  merkle: {
    root: String,
    proof: [String],
    date: String
  },
  timestamp: {
    authority: String,
    certifiedTime: Number,
    tsaSignatures: [String]
  },
  biometric: {
    hash: String,
    method: String,
    verified: Boolean
  },
  pdfUrl: String,
  qrCode: String,
  verificationUrl: String,
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: Date,
  revokedBy: mongoose.Schema.Types.ObjectId,
  revokedReason: String,
  downloads: {
    type: Number,
    default: 0
  },
  verifications: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for blockchain explorer URL
CertificateSchema.virtual('blockchainExplorerUrl').get(function() {
  if (this.blockchain.transactionHash) {
    const network = this.blockchain.network === 'polygon-mainnet' ? 'polygonscan.com' : 'mumbai.polygonscan.com';
    return `https://${network}/tx/${this.blockchain.transactionHash}`;
  }
  return null;
});

// Virtual for IPFS gateway URL
CertificateSchema.virtual('ipfsGatewayUrl').get(function() {
  if (this.ipfs.hash) {
    return `https://ipfs.io/ipfs/${this.ipfs.hash}`;
  }
  return null;
});

// Method to verify certificate integrity
CertificateSchema.methods.verifyIntegrity = async function() {
  const crypto = require('crypto');
  
  // Recreate hash from metadata
  const dataToHash = JSON.stringify({
    studentId: this.studentId,
    projectId: this.projectId,
    type: this.type,
    metadata: this.metadata,
    timestamp: this.createdAt
  });
  
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  
  return {
    valid: hash === this.certificateHash,
    expectedHash: hash,
    actualHash: this.certificateHash
  };
};

// Method to check if certificate is valid
CertificateSchema.methods.isValid = function() {
  return !this.isRevoked && this.blockchain.verified;
};

// Indexes
CertificateSchema.index({ studentId: 1, createdAt: -1 });
CertificateSchema.index({ projectId: 1 });
CertificateSchema.index({ type: 1 });
CertificateSchema.index({ 'blockchain.transactionHash': 1 });
CertificateSchema.index({ 'ipfs.hash': 1 });
CertificateSchema.index({ isRevoked: 1 });
CertificateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Certificate', CertificateSchema);
