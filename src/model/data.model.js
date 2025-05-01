const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    device_id: {
      type: String,
      required: true,
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
    garden_name: { 
      type: String, 
      required: true 
    },
    user: {
      type: String,
      required: true
    },
    time_on: {
      type: Date
    },
    time_off: {
        type: Date
    },
    duration_on: {
        type: Number
    },
    value: {
        type: Number
    },
    timestamp: {
        type: Date
    },
    year: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
    },
    day: {
        type: Number,
        required: true,
    }
  }, {
    timestamps: true // thêm createdAt và updatedAt
  });
  
  module.exports = mongoose.model('Data', dataSchema);