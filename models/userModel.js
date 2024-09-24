const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    businessName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    bitcoinAddress:{
        type:String,   
    },
    bitcoinPrivateKey:{
        type:String,   
    },
    dob:{
        type:String
    },
    phoneNumber:{
        type:String
    },
    country:{
        type:String
    },
    password:{
        type:String,
        required:true
    },
    accountBalance:{
        type:Number,
        default:0
    },
    coinBalance:{
        type:Number,
        default:0
    },
    totalProfit:{
        type:Number,
        default:0
    },
    totalDeposit:{
        type:Number,
        default:0
    },
    totalBonus:{
        type:Number,
        default:0
    },
    referralBonus:{
        type:Number,
        default:0
    },
    totalWithdrawn:{
        type:Number,
        default:0
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    login:{
        type:Boolean,
        default:false
    },
    suspended:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum: ['suspended', 'approved','pending', 'active'],
        default:'pending'
    },
    type:{
        type:String,
        enum: ['admin', 'superAdmin']
    },
    token:{
        type:String,
    },
    deposits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deposit'
    }],
    otp: {
        type: String,  // Store the OTP
    },
    otpExpiration: {
        type: Date,  // Store the expiration time of the OTP
    }
 
},{timestamps:true})

const userModel = mongoose.model('userModel', userSchema)

module.exports = userModel