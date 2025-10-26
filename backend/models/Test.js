const mongoose = require('mongoose');

const SkillTestSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Target role is required'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number,
    required: [true, 'Test duration is required'],
    min: [5, 'Duration must be at least 5 minutes'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },
  questions: [{
    questionId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'coding', 'true-false', 'short-answer'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    points: {
      type: Number,
      default: 1,
      min: 1
    },
    difficulty: String,
    code: {
      language: String,
      starterCode: String,
      testCases: [{
        input: String,
        expectedOutput: String,
        points: Number,
        hidden: Boolean
      }]
    },
    explanation: String
  }],
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  antiCheat: {
    enabled: {
      type: Boolean,
      default: true
    },
    monitoring: {
      networkScan: {
        type: Boolean,
        default: true
      },
      tabSwitching: {
        type: Boolean,
        default: true
      },
      screenSharing: {
        type: Boolean,
        default: true
      },
      clipboard: {
        type: Boolean,
        default: true
      },
      cameraProctoring: {
        type: Boolean,
        default: false
      }
    },
    maxViolations: {
      type: Number,
      default: 3
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  averageScore: {
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

// Calculate total points before saving
SkillTestSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }
  next();
});

// Indexes
SkillTestSchema.index({ role: 1, isActive: 1 });
SkillTestSchema.index({ difficulty: 1 });
SkillTestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SkillTest', SkillTestSchema);
