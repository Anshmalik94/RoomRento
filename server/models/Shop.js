const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    default: 'Shop',
    immutable: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Retail', 'Food & Beverage', 'Services', 'Office Space', 'Warehouse']
  },
  businessType: {
    type: String,
    required: true,
    enum: [
      'General Store', 'Clothing', 'Electronics', 'Restaurant', 'Cafe', 
      'Salon', 'Medical', 'Office', 'Warehouse', 'Other'
    ]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: false
  },
  longitude: {
    type: Number,
    required: false
  },
  shopArea: {
    type: Number,
    required: true,
    min: 1
  },
  parkingSpaces: {
    type: Number,
    default: 0,
    min: 0
  },
  amenities: [{
    type: String,
    enum: [
      'Parking', 'CCTV', 'Security Guard', 'WiFi', 'Air Conditioning',
      'Elevator', 'Loading Dock', 'Storage Space', 'Restrooms', 'Power Backup',
      'Water Supply', 'Waste Management', 'Fire Safety', 'Disabled Access',
      'Display Windows', 'Signage Space', 'Sound System', 'Lighting'
    ]
  }],
  openingHours: {
    type: String,
    default: '09:00'
  },
  closingHours: {
    type: String,
    default: '21:00'
  },
  rules: {
    type: String,
    maxlength: 500
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  images: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
shopSchema.index({ location: 'text', title: 'text', description: 'text' });
shopSchema.index({ category: 1, businessType: 1, price: 1 });
shopSchema.index({ owner: 1 });
shopSchema.index({ location: 1 });
shopSchema.index({ shopArea: 1 });
shopSchema.index({ createdAt: -1 });

// Virtual for formatted price
shopSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toLocaleString()}`;
});

// Virtual for formatted area
shopSchema.virtual('formattedArea').get(function() {
  return `${this.shopArea} sq ft`;
});

// Ensure virtual fields are serialized
shopSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Shop', shopSchema);
