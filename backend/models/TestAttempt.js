const mongoose = require('mongoose');

const TestAttemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'terminated', 'banned'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  timeSpent: {
    type: Number,
    default: 0
  },
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    reasoning: {
      type: String,
      required: true,
      minlength: [20, 'Please provide a detailed reasoning (minimum 20 characters)'],
      maxlength: [1000, 'Reasoning should not exceed 1000 characters']
    },
    timeSpent: Number,
    isCorrect: Boolean,
    pointsEarned: {
      type: Number,
      default: 0
    },
    submittedAt: Date,
    adminFeedback: {
      type: String,
      maxlength: 500
    },
    adminRating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  score: {
    obtained: {
      type: Number,
      default: 0
    },
    total: Number,
    percentage: {
      type: Number,
      default: 0
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
    }
  },
  violations: [{
    type: {
      type: String,
      enum: ['tab-switch', 'network-leak', 'clipboard-access', 'screen-share', 'multiple-tabs', 'suspicious-activity']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    severity: {
      type: String,
      enum: ['warning', 'critical'],
      default: 'warning'
    }
  }],
  warningCount: {
    type: Number,
    default: 0
  },
  terminated: {
    isTerminated: {
      type: Boolean,
      default: false
    },
    reason: String,
    timestamp: Date
  },
  banned: {
    isBanned: {
      type: Boolean,
      default: false
    },
    bannedUntil: Date,
    reason: String
  },
  proctoring: {
    screenshots: [String],
    webcamCaptures: [String],
    behaviorLog: [{
      timestamp: Date,
      action: String,
      suspiciousActivity: Boolean
    }]
  },
  adminReview: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewDate: Date,
    interviewScheduled: Boolean,
    interviewDate: Date,
    interviewPassed: Boolean,
    interviewNotes: String,
    projectReviewPassed: Boolean,
    projectReviewNotes: String,
    finalApproved: Boolean,
    certificateIssued: Boolean,
    certificateId: String
  },
  retestEligible: {
    type: Boolean,
    default: false
  },
  retestDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate grade based on percentage
TestAttemptSchema.methods.calculateGrade = function() {
  const percentage = this.score.percentage;
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'B+';
  if (percentage >= 80) return 'B';
  if (percentage >= 75) return 'C+';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Check if passed
TestAttemptSchema.methods.hasPassed = function(passingScore = 70) {
  return this.score.percentage >= passingScore;
};

// Check if can retake
TestAttemptSchema.methods.canRetake = function() {
  if (this.banned.isBanned) {
    return this.banned.bannedUntil < new Date();
  }
  return this.retestEligible;
};

// Pre-save middleware
TestAttemptSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.score.total && this.score.obtained >= 0) {
    this.score.percentage = Math.round((this.score.obtained / this.score.total) * 100);
    this.score.grade = this.calculateGrade();
  }
  
  // Set end time if completed
  if (this.status === 'completed' && !this.endTime) {
    this.endTime = new Date();
    this.timeSpent = Math.round((this.endTime - this.startTime) / 1000); // in seconds
  }
  
  // Set retest eligibility after ban period
  if (this.banned.isBanned && this.banned.bannedUntil < new Date()) {
    this.retestEligible = true;
    this.retestDate = new Date();
  }
  
  next();
});

// Indexes
TestAttemptSchema.index({ studentId: 1, testId: 1 });
TestAttemptSchema.index({ status: 1 });
TestAttemptSchema.index({ 'score.percentage': -1 });
TestAttemptSchema.index({ createdAt: -1 });
TestAttemptSchema.index({ 'banned.bannedUntil': 1 });

module.exports = mongoose.model('TestAttempt', TestAttemptSchema);
