const mongoose = require('mongoose')

const koraPaySchema = new mongoose.Schema({
    reference:{
        type:String,
    },
    amount:{
        type:String,
        required:true
    },
    currency: {
        type: String,
        required: true
      },
    customerName: {
          type: String,
          required: false
      },
      account_name:{
        type: String,
      },
      status: {
        type: String,
       
      },
    narration:{
        type:String,
        required:false
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