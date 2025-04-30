const express = require("express");
const router = express.Router()
const DeviceController = require("../controller/device.controller")

const auth = require("../lib/auth")

router.get('/getDeviceByUser', DeviceController.getDeviceByUser);
router.get('/getDeviceByCategory', DeviceController.getDeviceByCategory);
router.get('/getDeviceByUserAndCategory', DeviceController.getDeviceByUserAndCategory);
router.get('/getDeviceByUserAndType', DeviceController.getDeviceByUserAndType);
router.get('/getDeviceByLocation', DeviceController.getDeviceByLocation);
router.get('/getDeviceByGardenName', DeviceController.getDeviceByGardenName);
router.get('/getDeviceByType', DeviceController.getDeviceByType);
router.get('/getDeviceByIsActive', DeviceController.getDeviceByIsActive);


module.exports =  router