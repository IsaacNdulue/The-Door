const express = require('express')
const router = express.Router()
const {authenticateUser} = require('../middleware/authenticate')
const { signUp,verifyOtp,resendOtp,login ,confirmPayment,logOut, updateProfile, getOne, userProfile, getAll}=  require('../controllers/userController')
const {history} = require('../controllers/historyController')



router.post('/signup', signUp);
router.post('/otp/:id', verifyOtp);
router.post('/resendOtp', resendOtp);
router.post('/login', login);
router.get('/getone/:id', getOne);
router.get('/getAll', getAll);
router.get('/userProfile', authenticateUser, userProfile);
router.post('/confirmPayment', confirmPayment);
router.get('/history',history);
router.post('/logout', authenticateUser,logOut);
router.post('/updateUser', authenticateUser,updateProfile);
module.exports = router