const mongoose = require('mongoose');


const deviceSessionSchema = new mongoose.Schema({
    device_id: {
        type: String,
        required: true
      },
      action: {
        type: String,
        enum: ['Turn on', 'Turn off'],
        required: true
      },
      by: {
        type: String,
        enum: ['user', 'automatic system'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
});

module.exports = mongoose.model('session', deviceSessionSchema);