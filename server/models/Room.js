const mongoose = require('mongoose');

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
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
