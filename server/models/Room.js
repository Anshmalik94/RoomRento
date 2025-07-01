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
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
