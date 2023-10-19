const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const tokenMeddleware = require('../middlewares/token.meddleware');



router.post('/register', authController.register);
router.get('/verification/:token', authController.verifyEmail);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotpassword',authController.forgotPassword);
router.post('/resetpassword/:token',tokenMeddleware, authController.resetPassword);


module.exports = router;