const userModel= require('../models/userModel');
const paymentModel= require('../models/korapay');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validation = require('../middleware/validation')
const sendEmail = require('../helper/email')
const bitcore = require('bitcore-lib');
require('dotenv').config()




exports.signUp = async (req, res) => {
  try {
    const { firstName, lastName, businessName, email, password, phoneNumber } = req.body;
    const existingUser = await userModel.findOne({ $or: [{ businessName }, { email: email.toLowerCase() }] });

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (existingUser) {
      if (existingUser.businessName === businessName) {
        return res.status(400).json({
          message: `A user with businessName ${existingUser.businessName} already exists`
        });
      } else {
        return res.status(400).json({
          message: 'Email already exists'
        });
      }
    }

    // Validate input
    const validatedData = await validation.validateAsync({ firstName, lastName, businessName, email, password, phoneNumber });

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Generate Bitcoin wallet (Testnet for now)
    const keyPair = new bitcore.PrivateKey(bitcore.Networks.testnet); 
    const address = keyPair.toAddress().toString(); 
    const privateKey = keyPair.toWIF(); 

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = Date.now() + 10 * 60 * 1000; 


    const user = await userModel.create({
      firstName,
      lastName,
      businessName,
      email: email.toLowerCase(),
      password: hash,
      phoneNumber,
      bitcoinAddress: address, 
      bitcoinPrivateKey: privateKey,
      otp,
      otpExpiration
    });

    // Send OTP to the user's email
    const subject = 'Your OTP for Account Registration';
    const html = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP for Account Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .email-container {
            background-color: #ffffff;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background-color: #0056b3;
            color: white;
            padding: 20px;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            text-align: center;
            font-size: 24px;
        }
        .email-body {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }
        .otp-box {
            background-color: #eaf7ff;
            border: 1px solid #0056b3;
            padding: 10px;
            margin: 20px 0;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #0056b3;
        }
        .email-footer {
            text-align: center;
            font-size: 14px;
            color: #777777;
            padding: 20px;
            background-color: #f8f8f8;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        .email-footer a {
            color: #0056b3;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            Secure Your Account
        </div>
        <div class="email-body">
            <p>Dear <strong>${user.firstName}</strong>,</p>
            <p>Thank you for registering with <strong>The Door</strong>. To complete your account setup, please use the following One-Time Password (OTP) to verify your email address:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP is valid for the next 10 minutes. For your security, please do not share this OTP with anyone.</p>
            <p>If you did not request this registration, please contact our support team immediately at <a href="mailto:support@yourfintech.com">support@yourfintech.com</a>.</p>
            <p>Thank you for choosing <strong>The Door</strong>.</p>
        </div>
        <div class="email-footer">
            <p>Need help? Visit our <a href="https://yourfintech.com/support">Support Center</a></p>
            <p>&copy; 2024 The Door. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

    `;
    await sendEmail({
      email: user.email,
      subject,
      html
    });

    // Return success response (without registering the user yet)
    return res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      data: {
        userId: user._id,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: 'User not created',
      error: error.message
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Find the user by ID
    const user = await userModel.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the OTP matches and hasn't expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (Date.now() > user.otpExpiration) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark user as verified and clear OTP data
    user.isVerified = true;
    user.status = "approved"
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    return res.status(200).json({
      message: 'OTP verified successfully. Your account is now active.',
      data: {
        userId: user._id,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await userModel.findOne({ email: email.toLowerCase() });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const otpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Update user with new OTP and expiration time
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send the new OTP to the user's email
    const subject = 'Your New OTP for Account Verification';
    const html = `
      <p>Dear ${user.firstName},</p>
      <p>Your new OTP for completing the registration is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;
    await sendEmail({
      email: user.email,
      subject,
      html
    });

    return res.status(200).json({
      message: 'New OTP has been sent to your email.',
      data: {
        userId: user._id,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error resending OTP',
      error: error.message
    });
  }
};



exports.login = async (req,res) => {
  try {
    const {email,password} = req.body;
    const userExist = await userModel.findOne({email:email.toLowerCase()});

    if(!userExist){
      return res.status(401).json({
        message:'email is Incorrect',
      });
    }
    if (userExist.isVerified === false){
      return res.status(400).json({
          message:'Your account has not been verified',
        });
    }
    if (userExist.suspended === true){
      return res.status(403).json({
          message:'Your account has been suspended',
        });
    }

    const checkPassword = bcrypt.compareSync(password, userExist.password)
    if(!checkPassword){
      return res.status(400).json({
          message: "Incorrect password"
      })
  }

  const token = jwt.sign({
      userId:userExist._id, 
      email:userExist.email
  }, process.env.jwtSecret, { expiresIn: "1d" })
  
  userExist.login = true
  userExist.token = token
  await userExist.save()
   
  res.status(200).json({
  message:'Login successful',
  token,
  data:userExist
 })
 
  } catch (error) {
    res.status(500).json({
      message:'Error during Login',
      error:error.message
    });
  }

};

exports.confirmPayment = async (req, res) => {

  if (!req.body) {
      return res.status(400).json({ message: 'Please provide payment data.' });
  }

  const { amount, reference, status } = req.body; 

  // Validate required fields
  if (!amount) {
      return res.status(400).json({ message: 'Amount is required.' });
  }
  if (!reference) {
      return res.status(400).json({ message: 'Reference is required.' });
  }
  if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
  }

  try {
      // Create a new payment record
      const paymentData = await paymentModel.create({
          amount,
          reference,
          status,
      });

      // Respond with the payment status
      res.status(200).json({ message: `Payment status: ${paymentData.status}` });
  } catch (error) {
      console.error('Error confirming payment:', error.message);
      res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};

exports.logOut= async (req,res)=>{
  try{
    const hasAuthorization = req.headers.authorization

    if(!hasAuthorization){
        return res.status(400).json({
            error:"Authorization token not found"
        })
    }

    const token = hasAuthorization.split(" ")[1]

    if(!token){
        return res.status(400).json({
            error: "Authorization not found"
        })
    }

    const decodeToken = jwt.verify(token, process.env.jwtSecret)

    const user = await userModel.findById(decodeToken.userId)

  
    if(!user){
        return res.status(400).json({
            error: "User not found"
        })
    }
    user.token = null;
    user.login = false
    await user.save()


      res.status(200).json({
        message:`User has been logged out `,
        data:user
      })
  }catch(error){
    res.status(500).json({
      message:error.message
    })
  }
}


// payment prof
// amount
// reference
// status


exports.updateProfile =async(req,res)=>{
  try{
    const {firstName, lastName, businessName, email, password, phoneNumber,dob, country} = req.body;
    const id = req.user.userId;
    if (!req.body) {
      return res.status(400).json({ message: 'Nothing to Update.' });
  }
  const user = await userModel.findById(id);
  if (!user){
    return res.status(404).json({ 
      message:"User not found"
    })
  }
  
   const updateData = {};

   if (firstName) updateData.firstName = firstName;
   if (lastName) updateData.lastName = lastName;
   if (businessName) updateData.businessName = businessName;
   if (email) updateData.email = email.toLowerCase();
   if (phoneNumber) updateData.phoneNumber = phoneNumber;
   if (dob) updateData.dob = dob;
   if (country) updateData.country = country;

   if (password) {
     const salt = bcrypt.genSaltSync(10);
     const hash = bcrypt.hashSync(password, salt);
     updateData.password = hash;
   }

   
   const updatedUser = await userModel.findByIdAndUpdate(
     id,
     { $set: updateData },
     { new: true, runValidators: true }
   );

   if (!updatedUser) {
     return res.status(404).json({ message: 'User not found' });
   }

   return res.status(200).json({
     message: 'User updated successfully',
     data: updatedUser
   });

  }catch(error){
   res.status(500).json({
    message:error.message
   })
  }

};

exports.getOne = async(req, res)=>{
  try{
  const id = req.params.id;
  if (!id){
    return res.status(404).json({
      message : `user with ID:${id} does not exist `
    })
  }
  const user = await userModel.findById(id);

  res.status(200).json({
    message: "user found successfully",
    data: user
  })


  }catch(error){
    res.status(500).json({
      message:error.message
    })
  }

}

exports.userProfile = async(req, res)=>{
  try{
  const id = req.user.userId;
  if (!id){
    return res.status(404).json({
      message : `user does not exist `
    })
  }
  const user = await userModel.findById(id);

  res.status(200).json({
    message: "user retrieve successfully",
    data: user
  })


  }catch(error){
    res.status(500).json({
      message:error.message
    })
  }
}


exports.getAll = async(req, res)=>{
  try{
 
  const user = await userModel.find();

  res.status(200).json({
    message: "users retrieve successfully",
    data: user
  })


  }catch(error){
    res.status(500).json({
      message:error.message
    })
  }
}
