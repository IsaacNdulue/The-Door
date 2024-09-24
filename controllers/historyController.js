

const withdrawModel = require("../models/withdrawalModel");
const userModel = require("../models/userModel");

// const depositModel =require("../model/depositModel");



exports.history = async(req,res)=>{
    try{
      const id = req.user.userId;

// const transfer = await transferModel.find({$or:[{senderId: id}, {receiverId: id}]}).lean();
const withdraw = await withdrawModel.find({userId: id}).lean();

// const deposit = await depositModel.find({userId: id}).lean();

const userhistory = [...withdraw, ...deposit]
// ...transfer, 
userhistory.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

res.status(200).json({
    message:`All user's transaction is ${userhistory.length}`,
    data:userhistory
})


    }catch(error){
res.status(500).json({
    error:error.message
})
    }
}