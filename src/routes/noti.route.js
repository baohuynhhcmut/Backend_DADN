const express = require('express');
const router = express.Router();
const { getNotificationByUser, markNotificationAsRead, getAllNotifications } = require('../controller/noti.controller');

router.get('/user', getNotificationByUser);
router.put('/:id/read', markNotificationAsRead);
router.get('/', getAllNotifications);

module.exports = router;