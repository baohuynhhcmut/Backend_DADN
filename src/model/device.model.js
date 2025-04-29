const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    device_id: {
      type: String,
      required: true,
      unique: true
    },
    device_name: {
      type: String,
      required: true
    },
    feed: {
      type: String,
      enum: ['V1', 'V2', 'V3', 'V4', 'V10', 'V11'], // chỉ nhận các giá trị feed hợp lệ
      required: true
    },
    type: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['sensor', 'device'],
      required: true
    },
    location: {
      garden_name: {
        type: String
      },
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      }
    },
    user: {
      type: String
    },
    time_on: {
      type: Date
    },
    time_off: {
      type: Date
    },
    is_active: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true // thêm createdAt và updatedAt
  });
  
  module.exports = mongoose.model('Device', deviceSchema);