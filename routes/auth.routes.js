const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

//routes list
router.get('/signup',authController.getSignup);
router.post('/signup',authController.signup);
router.get('/login',authController.getLogin);
router.post('/login',authController.login);
router.post('/logout', authController.logout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
module.exports = router;