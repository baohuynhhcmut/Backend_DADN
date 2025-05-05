//getAllSessions
const express = require('express');
const router = express.Router();
const { getAllSessions } = require('../controller/session.controller');

router.get('/getAllSessions', getAllSessions);

module.exports = router;