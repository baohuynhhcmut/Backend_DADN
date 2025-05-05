const express = require("express");
const router = express.Router()
const DataController = require("../controller/data.controller")

const auth = require("../lib/auth")

router.get('/getDataByDay', DataController.getDataByDay);
router.get('/getDataByMonth', DataController.getDataByMonth);
router.get('/getDataByYear', DataController.getDataByYear);
router.get('/getDataByTimestamp', DataController.getDataByTimestamp);


module.exports =  router