const express = require("express");
const router = express.Router()
const DeviceController = require("../controller/device.controller")

const auth = require("../lib/auth")

router.get('/getDeviceByUser', DeviceController.getDeviceByUser);


module.exports =  router