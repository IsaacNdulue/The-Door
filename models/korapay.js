const mongoose = require('mongoose')

const koraPaySchema = new mongoose.Schema({
    reference:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    currency: {
        type: String,
        required: true
      },
    customer: {
        name: {
          type: String,
          required: false
        },
        email: {
          type: String,
          required: true,
          match: [/.+\@.+\..+/, 'Please fill a valid email address'] // Optional email validation
        }
      },
      account_name:{
        type: String,
        required:false
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
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