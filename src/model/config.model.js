const mongoose = require('mongoose');

// Định nghĩa schema cho giá trị min-max
const valueRangeSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true }
}, { _id: false });

const thresholdSchema = new mongoose.Schema({
  V1: valueRangeSchema,
  V3: valueRangeSchema,
  V4: valueRangeSchema,
  V10: valueRangeSchema,
  V11: valueRangeSchema
}, { _id: false });

// Cấu trúc chính cho Config
const configSchema = new mongoose.Schema({
  threshold: [thresholdSchema]  // threshold là một mảng chứa các đối tượng threshold
});

const ConfigModel = mongoose.model('Config', configSchema);

module.exports = ConfigModel;