const express = require('express');
const multer = require('multer');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'RoomRento',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});

const upload = multer({ storage });

router.post('/', auth, upload.array('images', 10), async (req, res) => {
    try {
        const images = req.files.map(file => file.path);

        const room = new Room({
            ...req.body,
            images,
            user: req.user.id,
        });

        await room.save();
        res.json(room);
    } catch (err) {
        console.log("Room Add Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });
        res.json(rooms);
    } catch (err) {
        console.log("Fetch Rooms Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        res.json(room);
    } catch (err) {
        console.log("Fetch Room by ID Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
