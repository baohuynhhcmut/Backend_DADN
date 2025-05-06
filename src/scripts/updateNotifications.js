const mongoose = require('mongoose');
const Notification = require('../model/noti.model');
require('dotenv').config();

const updateExistingNotifications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dadn');
    console.log('Connected to MongoDB');

    // Update all notifications that don't have a 'read' field
    const result = await Notification.updateMany(
      { read: { $exists: false } },
      { $set: { read: false } }
    );

    console.log(`Updated ${result.modifiedCount} notifications`);
    console.log('Update completed successfully');
  } catch (error) {
    console.error('Error updating notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the update function
updateExistingNotifications(); 