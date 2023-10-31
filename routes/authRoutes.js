const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const tokenMeddleware = require('../middlewares/token.meddleware');
const isLogged = require('../middlewares/isLogged.meddleware');



router.post('/register',isLogged, authController.register);
router.get('/verification/:token', authController.verifyEmail);
router.post('/login',isLogged, authController.login);
router.get('/logout', authController.logout);
router.post('/forgotpassword',authController.forgotPassword);
router.post('/resetpassword/:token',tokenMeddleware, authController.resetPassword);


module.exports = router;