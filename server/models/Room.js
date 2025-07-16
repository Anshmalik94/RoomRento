const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    location: String,
    landmark: String,   
    address: String,    
    latitude: Number,
    longitude: Number,
    images: [String],
    roomType: String,
    furnished: String,
    availableFrom: String,
    available: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    type: { type: String, default: 'Room' }, // Property type: Room, Hotel, Shop
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 }
}, { timestamps: true });

// Calculate average rating when reviews are updated
roomSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.averageRating = 0;
    } else {
        const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
        this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10; // Round to 1 decimal
    }
};

module.exports = mongoose.model('Room', roomSchema);
