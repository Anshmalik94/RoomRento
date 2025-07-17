const mongoose = require('mongoose');

const helpTopicSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Booking Issues',
      'Login & Registration', 
      'Room Listing & Upload',
      'Map or Location Problem',
      'Contact Issues',
      'Payment Issues',
      'General'
    ]
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  answer: {
    type: String,
    required: true,
    maxlength: 2000
  },
  relatedKeywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  priority: {
    type: Number,
    default: 1, // Higher number = higher priority
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Index for better search performance
helpTopicSchema.index({ 
  question: 'text', 
  answer: 'text', 
  relatedKeywords: 'text' 
});
helpTopicSchema.index({ category: 1, isActive: 1 });
helpTopicSchema.index({ priority: -1, viewCount: -1 });

// Virtual for helpfulness ratio
helpTopicSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  return total > 0 ? (this.helpfulCount / total) * 100 : 0;
});

// Ensure virtual fields are serialized
helpTopicSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('HelpTopic', helpTopicSchema);
