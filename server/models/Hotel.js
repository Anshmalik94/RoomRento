const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
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
    default: 'Hotel',
    immutable: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Budget', 'Mid-Range', 'Luxury', 'Boutique', 'Resort']
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
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  roomTypes: [{
    type: String,
    enum: ['Standard', 'Deluxe', 'Suite', 'Family Room', 'Executive']
  }],
  amenities: [{
    type: String,
    enum: [
      'WiFi', 'Air Conditioning', 'TV', 'Mini Fridge', 'Room Service',
      'Laundry Service', 'Parking', 'Swimming Pool', 'Gym', 'Restaurant',
      'Bar', 'Spa', 'Conference Room', 'Airport Shuttle', 'Pet Friendly',
      'Concierge', 'Business Center', 'Elevator', '24/7 Reception'
    ]
  }],
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '11:00'
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
hotelSchema.index({ location: 'text', title: 'text', description: 'text' });
hotelSchema.index({ category: 1, price: 1 });
hotelSchema.index({ owner: 1 });
hotelSchema.index({ location: 1 });
hotelSchema.index({ createdAt: -1 });

// Virtual for formatted price
hotelSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toLocaleString()}`;
});

// Ensure virtual fields are serialized
hotelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Hotel', hotelSchema);
