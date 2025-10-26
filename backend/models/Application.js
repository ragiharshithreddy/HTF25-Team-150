const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  preferredRole: {
    type: String,
    required: [true, 'Please specify your preferred role'],
    trim: true
  },
  resumeUrl: {
    type: String
  },
  motivation: {
    type: String,
    required: [true, 'Please provide a motivation statement'],
    maxlength: [1000, 'Motivation cannot exceed 1000 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    maxlength: [500, 'Experience description cannot exceed 500 characters']
  },
  availability: {
    hoursPerWeek: {
      type: Number,
      min: [1, 'Hours must be at least 1'],
      max: [40, 'Hours cannot exceed 40']
    },
    startDate: Date
  },
  skillTest: {
    required: {
      type: Boolean,
      default: true
    },
    attemptId: {
      type: String
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'passed', 'failed'],
      default: 'not-started'
    },
    score: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    completedAt: Date,
    questions: [{
      questionId: String,
      question: String,
      answer: Number,
      reasoning: String,
      isCorrect: Boolean,
      timeSpent: Number,
      adminReview: {
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        feedback: String,
        suitabilityScore: {
          type: Number,
          min: 0,
          max: 100
        }
      }
    }],
    adminNotes: String
  },
  communication: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number
    }]
  }],
  status: {
    type: String,
    enum: ['pending', 'test-required', 'test-completed', 'under-review', 'shortlisted', 'approved', 'rejected', 'withdrawn'],
    default: 'test-required'
  },
  assignedRole: {
    type: String,
    trim: true
  },
  assignedBatch: {
    type: String,
    trim: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  reviewNotes: {
    type: String,
    maxlength: 500
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
ApplicationSchema.index({ studentId: 1, projectId: 1 }, { unique: true });

// Other indexes
ApplicationSchema.index({ status: 1, appliedAt: -1 });
ApplicationSchema.index({ projectId: 1, status: 1 });
ApplicationSchema.index({ studentId: 1, status: 1 });

// Pre-save middleware
ApplicationSchema.pre('save', async function(next) {
  // Auto-assign batch and role when approved
  if (this.isModified('status') && this.status === 'approved') {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.projectId);
    
    if (project) {
      this.assignedBatch = project.batch;
      if (!this.assignedRole) {
        this.assignedRole = this.preferredRole;
      }
      this.reviewedAt = new Date();
    }
  }
  next();
});

// Post-save middleware to update project counts
ApplicationSchema.post('save', async function() {
  const Project = mongoose.model('Project');
  const project = await Project.findById(this.projectId);
  
  if (project) {
    // Update applications count
    const Application = mongoose.model('Application');
    project.applicationsCount = await Application.countDocuments({ projectId: this.projectId });
    project.approvedCount = await Application.countDocuments({ 
      projectId: this.projectId, 
      status: 'approved' 
    });
    
    // Update role filled count
    if (this.status === 'approved' && this.assignedRole) {
      const roleIndex = project.availableRoles.findIndex(r => r.role === this.assignedRole);
      if (roleIndex !== -1) {
        const filledCount = await Application.countDocuments({
          projectId: this.projectId,
          status: 'approved',
          assignedRole: this.assignedRole
        });
        project.availableRoles[roleIndex].filled = filledCount;
      }
    }
    
    await project.save();
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
