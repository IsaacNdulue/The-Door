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
      },
    customerName: {
          type: String,
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
    description:{
        type:String,
        required:false
    },
    userId: {
        type:String,
    }
},{timestamps:true})

const koraPayModel = mongoose.model('koraPayModel',koraPaySchema)

module.exports = koraPayModel
// payment prof
// amount
// reference
// status