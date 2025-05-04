const ConfigModel = require('../model/config.model'); // điều chỉnh đường dẫn nếu cần

const updateThreshold = async (req, res) => {
    try {
      const updates = req.body;
  
      // Danh sách các key được chấp nhận
      const allowedKeys = ['V1', 'V3', 'V4', 'V10', 'V11'];
  
      // Kiểm tra hợp lệ cho từng trường trong body
      for (const key of Object.keys(updates)) {
        if (!allowedKeys.includes(key)) {
          return res.status(400).json({ message: `Invalid field: ${key}` });
        }
  
        const { min, max } = updates[key];
  
        if (min === undefined || max === undefined) {
          return res.status(400).json({ message: `Missing min or max for ${key}` });
        }
  
        if (typeof min !== 'number' || typeof max !== 'number') {
          return res.status(400).json({ message: `min and max must be numbers for ${key}` });
        }
  
        if (min >= max) {
          return res.status(400).json({ message: `min must be less than max for ${key}` });
        }
      }
  
      // Lấy document đầu tiên
      const config = await ConfigModel.findOne();
      if (!config) return res.status(404).json({ message: 'Config not found' });
  
      // Kiểm tra threshold[0]
      if (!config.threshold[0]) {
        return res.status(404).json({ message: 'Threshold not found' });
      }
  
      // Thực hiện cập nhật
      Object.keys(updates).forEach(key => {
        config.threshold[0][key] = {
          ...config.threshold[0][key]?._doc,
          ...updates[key]
        };
      });
  
      await config.save();
      res.json({ message: 'Threshold updated successfully', data: config.threshold[0] });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = { updateThreshold };