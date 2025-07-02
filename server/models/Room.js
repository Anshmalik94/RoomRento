const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    location: String,
    images: [String],
    roomType: String,
    furnished: String,
    availableFrom: String,
    available: { type: Boolean, default: true },  // Available flag future use ke liye, koi toggle nahi abhi
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
