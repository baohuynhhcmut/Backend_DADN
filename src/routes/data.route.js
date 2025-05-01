const express = require("express");
const router = express.Router()
const DataController = require("../controller/data.controller")

const auth = require("../lib/auth")

router.get('/getDataByMonth', DataController.getDataByMonth);
router.get('/getDataByYear', DataController.getDataByYear);


module.exports =  router