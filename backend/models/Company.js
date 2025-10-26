const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true
  },
  domain: {
    type: String,
    required: [true, 'Company domain is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  logo: {
    type: String,
    default: ''
  },
  website: {
    type: String
  },
  industry: {
    type: String,
    enum: ['technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'consulting', 'other'],
    default: 'technology'
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  location: {
    type: String
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required']
  },
  contactPhone: {
    type: String
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  isOpenSource: {
    type: Boolean,
    default: false
  },
  settings: {
    allowPublicProjects: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: true
    },
    maxProjects: {
      type: Number,
      default: 50
    },
    maxAdmins: {
      type: Number,
      default: 5
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  metadata: {
    totalProjects: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for fast lookups
CompanySchema.index({ domain: 1 });
CompanySchema.index({ status: 1 });
CompanySchema.index({ isOpenSource: 1 });

module.exports = mongoose.model('Company', CompanySchema);
