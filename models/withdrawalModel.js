const mongoose = require('mongoose')

const koraPaySchema = new mongoose.Schema({
    description:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    bank:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel" 
    }
},{timestamps:true})

const withdrawalModel = mongoose.model('withdrawalModel',koraPaySchema)

module.exports = withdrawalModel