const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous users
  },
  searchQuery: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: false
  },
  foundSolution: {
    type: Boolean,
    default: false
  },
  helpTopicViewed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HelpTopic',
    required: false
  },
  escalatedToWhatsApp: {
    type: Boolean,
    default: false
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  sessionData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for analytics
supportRequestSchema.index({ createdAt: -1 });
supportRequestSchema.index({ category: 1, foundSolution: 1 });
supportRequestSchema.index({ escalatedToWhatsApp: 1 });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
