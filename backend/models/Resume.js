const mongoose = require('mongoose');

const ResumeTemplateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['professional', 'creative', 'minimalist', 'modern', 'academic', 'technical'],
    default: 'professional'
  },
  layout: {
    structure: {
      type: String,
      required: true
    },
    styles: {
      type: mongoose.Schema.Types.Mixed
    },
    sections: [{
      name: String,
      position: Number,
      required: Boolean,
      editable: Boolean
    }]
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preview: String,
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const StudentResumeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: String,
    required: true
  },
  resumeData: {
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      portfolio: String,
      profilePhoto: String
    },
    summary: {
      type: String,
      maxlength: 500
    },
    skills: [{
      category: String,
      items: [String],
      verified: {
        type: Boolean,
        default: false
      }
    }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      location: String,
      description: String,
      achievements: [String]
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      gpa: String,
      achievements: [String]
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      githubUrl: String,
      liveUrl: String,
      role: String,
      fromPlatform: Boolean,
      certificateId: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
      credentialUrl: String,
      fromPlatform: Boolean,
      blockchainVerified: Boolean
    }],
    customSections: [{
      title: String,
      content: String
    }]
  },
  atsAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    lastChecked: Date,
    keywords: [String],
    missingKeywords: [String],
    suggestions: [String],
    roleMatch: {
      targetRole: String,
      matchPercentage: Number
    }
  },
  versions: [{
    versionNumber: Number,
    createdAt: {
      type: Date,
      default: Date.now
    },
    data: mongoose.Schema.Types.Mixed,
    atsScore: Number
  }],
  pdfUrl: String,
  lastModified: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
ResumeTemplateSchema.index({ category: 1, isActive: 1 });
ResumeTemplateSchema.index({ downloads: -1 });
ResumeTemplateSchema.index({ rating: -1 });

StudentResumeSchema.index({ studentId: 1 });
StudentResumeSchema.index({ 'atsAnalysis.score': -1 });

const ResumeTemplate = mongoose.model('ResumeTemplate', ResumeTemplateSchema);
const StudentResume = mongoose.model('StudentResume', StudentResumeSchema);

module.exports = { ResumeTemplate, StudentResume };
