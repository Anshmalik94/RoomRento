// Migration script to add type field to existing rooms
const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();

const addTypeToRooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // First, check how many rooms exist
    const totalRooms = await Room.countDocuments();
    console.log(`Total rooms in database: ${totalRooms}`);
    
    // Check how many rooms don't have type field
    const roomsWithoutType = await Room.countDocuments({ type: { $exists: false } });
    console.log(`Rooms without type field: ${roomsWithoutType}`);
    
    // Update all rooms without type field to have type: 'Room'
    const result = await Room.updateMany(
      { type: { $exists: false } }, // Find documents without type field
      { $set: { type: 'Room' } }    // Add type: 'Room'
    );
    
    console.log(`Updated ${result.modifiedCount} rooms with type field`);
    
    // Verify the update
    const roomsWithType = await Room.countDocuments({ type: 'Room' });
    console.log(`Rooms with type 'Room': ${roomsWithType}`);
    
    await mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addTypeToRooms();
