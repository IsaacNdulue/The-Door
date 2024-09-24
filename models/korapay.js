const mongoose = require('mongoose')

const koraPaySchema = new mongoose.Schema({
    paymentproof:{
        type:String
    },
    amount:{
        type:String,
        required:true
    },
    reference:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel" 
    }
},{timestamps:true})

const koraPayModel = mongoose.model('koraPayModel',koraPaySchema)

module.exports = koraPayModel
// payment prof
// amount
// reference
// status