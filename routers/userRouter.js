const express = require('express')
const router = express.Router()
const {authenticateUser} = require('../middleware/authenticate')
const { signUp,verifyOtp,resendOtp,login ,confirmPayment,logOut}=  require('../controllers/userController')
const {history} = require('../controllers/historyController')



router.post('/signup', signUp)
router.post('/otp', verifyOtp)
router.post('/resendOtp', resendOtp)
router.post('/login', login)
router.post('/confirmPayment', confirmPayment)
router.get('/history',history)
router.post('/logout', authenticateUser,logOut)
module.exports = router