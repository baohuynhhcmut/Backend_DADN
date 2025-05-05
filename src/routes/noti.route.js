const express = require('express');
const router = express.Router();
const { getNotificationByUser } = require('../controller/noti.controller');

router.get('/user', getNotificationByUser);

module.exports = router;