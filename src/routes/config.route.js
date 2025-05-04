const express = require('express');
const router = express.Router();
const { updateThreshold } = require('../controller/config.controller');

// PUT /config/update-threshold
router.patch('/updateThreshold', updateThreshold);

module.exports = router;