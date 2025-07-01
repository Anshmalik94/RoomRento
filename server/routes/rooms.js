const express = require('express');
const multer = require('multer');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/', auth, upload.array('images', 10), async (req, res) => {
    try {
        const images = req.files.map(file => `${process.env.BASE_URL}/${file.path.replace(/\\/g, '/')}`);
        const room = new Room({
            ...req.body,
            images,
            user: req.user.id
        });
        await room.save();
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
