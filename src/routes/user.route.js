const express = require("express");
const router = express.Router()
const UserController = require("../controller/user.controller")

const auth = require("../lib/auth")

router.post('/login', UserController.LoginUser);
router.post('/register',UserController.RegisterUser)
router.get('/getByToken', UserController.GetUserByToken)
router.get('/getRoleUser', UserController.GetAllUserRoleUser)
router.get('/email',auth.authMiddleware, auth.adminMiddleware, UserController.GetUserInfoByEmail)
router.get('/',auth.authMiddleware, auth.adminMiddleware,UserController.GetAllUser)
router.post('/create', UserController.AddUser)
router.post('/addGarden', UserController.AddGarden)
router.put('/updateUserInfo', UserController.updateUserInfo)
router.put('/updatePassword', UserController.updatePassword)
router.put('/updateGarden', UserController.updateGarden)
router.delete('/deleteUser', UserController.deleteUser)
router.delete('/deleteGarden', UserController.deleteGarden)

module.exports =  router