const express = require("express");
const router = express.Router()
const WeatherController = require("../controller/weather.controller")

// const auth = require("../lib/auth")

// router.post('/login', UserController.LoginUser);
// router.post('/register',UserController.RegisterUser)
// router.get('/email',auth.authMiddleware, auth.adminMiddleware, UserController.GetUserInfoByEmail)
// router.get('/',auth.authMiddleware, auth.adminMiddleware,UserController.GetAllUser)

router.get('/', WeatherController.GetWeather)

module.exports =  router