const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  maxTeamSize: {
    type: Number,
    required: [true, 'Please provide maximum team size'],
    min: [1, 'Team size must be at least 1'],
    max: [20, 'Team size cannot exceed 20']
  },
  availableRoles: [{
    role: {
      type: String,
      required: true,
      trim: true
    },
    count: {
      type: Number,
      required: true,
      min: 1
    },
    filled: {
      type: Number,
      default: 0
    }
  }],
  batch: {
    type: String,
    required: [true, 'Please provide a batch name'],
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide an application deadline']
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'completed'],
    default: 'draft'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  category: {
    type: String,
    enum: ['web', 'mobile', 'ai-ml', 'blockchain', 'iot', 'data-science', 'other'],
    default: 'other'
  },
  technologies: [{
    type: String,
    trim: true
  }],
  githubRepo: {
    type: String,
    match: [/^https?:\/\/(www\.)?github\.com\/.*$/, 'Please provide a valid GitHub URL']
  },
  liveDemo: {
    type: String,
    match: [/^https?:\/\/.*$/, 'Please provide a valid URL']
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['documentation', 'tutorial', 'video', 'article', 'other']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  approvedCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if deadline has passed
ProjectSchema.virtual('isExpired').get(function() {
  return this.deadline < new Date();
});

// Virtual for remaining slots
ProjectSchema.virtual('remainingSlots').get(function() {
  const total = this.availableRoles.reduce((sum, role) => sum + role.count, 0);
  const filled = this.availableRoles.reduce((sum, role) => sum + role.filled, 0);
  return total - filled;
});

// Virtual for applications
ProjectSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'projectId',
  justOne: false
});

// Pre-save middleware
ProjectSchema.pre('save', function(next) {
  // Auto-close if deadline passed
  if (this.deadline < new Date() && this.status === 'active') {
    this.status = 'closed';
  }
  next();
});

// Indexes
ProjectSchema.index({ title: 'text', description: 'text' });
ProjectSchema.index({ status: 1, deadline: 1 });
ProjectSchema.index({ batch: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
