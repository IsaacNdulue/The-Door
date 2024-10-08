const nodemailer = require ('nodemailer');
 require('dotenv').config()
const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
    
    host: process.env.host,
    service : process.env.service,
    port: 587,
    secure:true,

    auth:{
        user : process.env.user,
        pass : process.env.mailPassword,
    },

   
    })


    let mailOption = { 
        from : process.env.user,
        to: options.email,
        subject:options.subject,
        html: options.html
    }
    await transporter.sendMail(mailOption)
    
}

module.exports = sendEmail