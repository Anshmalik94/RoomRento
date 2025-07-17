const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all bookings for owner
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate('room', 'title location price images') // Changed rent to price
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all bookings for renter
router.get('/my-requests', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate('room', 'title location price images') // Changed rent to price
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Get booking requests error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create new booking request
router.post('/create', auth, async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, message } = req.body;
    
    // Validate required fields
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ msg: 'Missing required fields: roomId, checkInDate, checkOutDate' });
    }
    
    // Validate dates
    const checkInDate_parsed = new Date(checkInDate);
    const checkOutDate_parsed = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate_parsed < today) {
      return res.status(400).json({ msg: 'Check-in date cannot be in the past' });
    }
    
    if (checkOutDate_parsed <= checkInDate_parsed) {
      return res.status(400).json({ msg: 'Check-out date must be after check-in date' });
    }
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    
    // Prevent self-booking
    if (room.user.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot book your own property' });
    }

    // Calculate total amount (example: days * price)
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = days * room.price; // Changed from room.rent to room.price

    const booking = new Booking({
      room: roomId,
      renter: req.user.id,
      owner: room.user, // Changed from room.owner to room.user
      bookingDate: new Date(),
      checkInDate,
      checkOutDate,
      totalAmount,
      message,
      contactInfo: {
        email: req.user.email,
        phone: req.user.phone || ''
      }
    });

    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('room', 'title location price images') // Changed rent to price
      .populate('renter', 'name email phone')
      .populate('owner', 'name email phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update booking status (Accept/Decline/Mark as Booked)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Only owner can update booking status
    if (booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room', 'title location price images') // Changed rent to price
      .populate('renter', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Allow deletion by owner or renter
    if (booking.owner.toString() !== req.user.id && booking.renter.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve booking request
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Only owner can approve
    if (booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only property owner can approve bookings' });
    }

    booking.status = 'approved';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room', 'title location price images')
      .populate('renter', 'name email phone')
      .populate('owner', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reject booking request
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Only owner can reject
    if (booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only property owner can reject bookings' });
    }

    booking.status = 'rejected';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room', 'title location price images')
      .populate('renter', 'name email phone')
      .populate('owner', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
