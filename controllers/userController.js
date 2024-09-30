const axios = require('axios');
const userModel= require('../models/userModel');
const paymentModel= require('../models/korapay');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validation = require('../middleware/validation')
const sendEmail = require('../helper/email')
const bitcore = require('bitcore-lib');

// const BLOCKCYPHER_API_KEY = process.env.BLOCKCYPHER_API_KEY;
// // const BLOCKCYPHER_API_URL = 'https://api.blockcypher.com/v1/btc/main';
// const BLOCKCYPHER_API_URL = process.env.BLOCKCYPHER_API_URL;

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
    const subject = 'your otp for account registration';
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
            notification
        </div>
        <div class="email-body">
            <p>dear <strong>${user.firstName}</strong>,</p>
            <p>Thank you for registering with <strong>The Door</strong>. To complete your account setup, please use the following One-Time Password (OTP) to verify your email address:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP is valid for the next 10 minutes. For your security, please do not share this OTP with anyone.</p>
            <p>If you did not request this registration, please contact our support team immediately at <a href="mailto:support@yourfintech.com">support@yourfintech.com</a>.</p>
            <p>Thank you for choosing <strong>The Door</strong>.</p>
        </div>
        <div class="email-footer">
            <p>Need help? Visit our <a href="https://thedoor.com/support">Support Center</a></p>
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
    const { otp } = req.body;
    const { id } = req.params;  // Extract userId from the params

    // Find the user by ID
    const user = await userModel.findById(id);

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
    user.status = "approved";
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
  // token,
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
  const { amount, reference, status, customerEmail,description, userId } = req.body; 

  // Validate required fields
  if (!amount) {
    return res.status(400).json({ message: 'Amount is required.' });
  }
  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Find the user by userId
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create a new payment record in paymentModel
    const paymentData = await paymentModel.create({
      amount,
      reference,
      status,
      customerEmail,
      description,
      userId
    });

    // If payment is successful, update user's fiatBalance and totalBalance
    if (status === 'success') {
      const paymentAmount = parseFloat(amount);

      // Update user's fiatBalance and totalBalance
      user.fiatBalance = (user.fiatBalance || 0) + paymentAmount;
      user.totalBalance = (user.totalBalance || 0) + paymentAmount;

      await user.save();
    }

    // Send payment confirmation email
    const subject = 'Payment Received';
    const html = `
      <h3>Dear ${user.firstName},</h3>
      <p>We are pleased to inform you that we have successfully received your payment of <strong>${amount} Naira</strong>.</p>
      <p>If you have any questions, feel free to reach out to us.</p>
      <p>Thank you for using our service!</p>
      <br />
      <p>Best regards,<br/>The Door</p>
    `;
    await sendEmail({
      email: user.email,
      subject,
      html
    });

    res.status(200).json({ 
      message: `Payment status: ${paymentData.status}`,
      updatedBalances: status === 'success' ? {
        fiatBalance: user.fiatBalance,
        totalBalance: user.totalBalance
      } : null
    });
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


// Function to update balance in MongoDB
const updateBalanceInDB = async (address, balance) => {
  try {
    const result = await userModel.findOneAndUpdate(
      { bitcoinAddress: address }, // Find user by bitcoin_address
      { coinBalance: balance },  // Update the balance
      { new: true } 
    );

    if (!result) {
      throw new Error('User with the given Bitcoin address not found');
    }

    console.log('Balance updated in MongoDB:', result );
  } catch (error) {
    console.error('Error updating balance in MongoDB:', error.message);
    throw new Error('Error updating balance in database');
  }
};

// Function to get balance from BlockCypher and update in MongoDB
const getBalanceAndUpdateDB = async (address) => {
  try {
  
    const response = await axios.get(`${process.env.BLOCKCYPHER_API_URL}/addrs/${address}/balance?token=${process.env.BLOCKCYPHER_API_KEY}`);
    const balance = response.data.balance;
    console.log('API Response:', response.data);
    // Update the balance in MongoDB
    await updateBalanceInDB(address, balance);

    return balance;
  } catch (error) {
    console.error('Error:', error.message || (error.response && error.response.data));
    throw new Error('Error retrieving balance from BlockCypher');
  }
};

// Express route for balance retrieval and update
exports.getBalanceController = async (req, res) => {
  const address = req.params.address;

  if (!address) {
    return res.status(400).json({ message: 'Bitcoin address is required' });
  }

  try {
    const balance = await getBalanceAndUpdateDB(address);
    res.status(200).json({ address,balance: balance !== undefined ? balance : 0  });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving balance', error: error.message });
  }
};



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


// Function to send Bitcoin
const sendBitcoin = async (fromAddress, toAddress, amount, privateKey) => {
  try {
    // Step 1: Fetch unspent transaction outputs (UTXOs)
    const utxoResponse = await axios.get(`${BLOCKCYPHER_API_URL}/addrs/${fromAddress}?unspentOnly=true&token=${BLOCKCYPHER_API_KEY}`);
    console.log('UTXO Response:', utxoResponse.data);

    const txrefs = utxoResponse.data.txrefs || [];
    const unconfirmedTxrefs = utxoResponse.data.unconfirmed_txrefs || [];

    if (txrefs.length === 0 && unconfirmedTxrefs.length === 0) {
      throw new Error('No UTXOs found for the address');
    }

    const allTxrefs = [...txrefs, ...unconfirmedTxrefs];
    const minOutputValue = 546; // Dust threshold in satoshis
    const filteredUtxos = allTxrefs.filter(utxo => utxo.value >= minOutputValue);

    if (filteredUtxos.length === 0) {
      throw new Error('No valid UTXOs found that meet the minimum value requirement');
    }

    const totalAvailable = filteredUtxos.reduce((acc, utxo) => acc + utxo.value, 0);
    if (amount > totalAvailable) {
      throw new Error('Insufficient funds to cover the transaction amount');
    }

    const utxos = filteredUtxos.map(utxo => ({
      txId: utxo.tx_hash,
      outputIndex: utxo.tx_output_n,
      address: fromAddress,
      script: bitcore.Script.buildPublicKeyHashOut(bitcore.Address.fromString(fromAddress)).toString(),
      satoshis: utxo.value,
    }));

    const transaction = new bitcore.Transaction()
      .from(utxos)
      .to(toAddress, amount)
      .change(fromAddress)
      .sign(privateKey);

    const serializedTx = transaction.serialize();
    const sendTxResponse = await axios.post(`${BLOCKCYPHER_API_URL}/txs/push?token=${BLOCKCYPHER_API_KEY}`, {
      tx: serializedTx,
    });

    return sendTxResponse.data.tx.hash; // Return transaction ID

  } catch (error) {
    console.error('Error in sendBitcoin:', error.message);
    const errorMsg = error.response && error.response.data ? error.response.data.error : error.message;
    throw new Error(`Failed to send Bitcoin transaction: ${errorMsg}`);
  }
};

// Controller function for /send endpoint
exports.sendBitcoinTransaction = async (req, res) => {
  const { fromAddress, toAddress, amount, privateKey, userId } = req.body;

  try {
    // Validate input
    if (!fromAddress || !toAddress || !amount || !privateKey || !userId) {
      return res.status(400).json({ message: 'All fields (fromAddress, toAddress, amount, privateKey, userId) are required' });
    }

    // Fetch user from MongoDB
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert amount from Bitcoin to satoshis
    const amountInSatoshis = amount * 1e8;

    // Send Bitcoin and get the transaction ID
    const txId = await sendBitcoin(fromAddress, toAddress, amountInSatoshis, privateKey);

    // Update user balance
    user.fiatBalance = (user.fiatBalance || 0) - amountInSatoshis;
    await user.save();

    // Log the transaction in MongoDB
    const newTransaction = new TransactionModel({
      userId: user._id,
      fromAddress,
      toAddress,
      amount: amountInSatoshis,
      txId,
      status: 'success',
      createdAt: new Date(),
    });
    await newTransaction.save();

    res.status(200).json({ message: 'Transaction sent successfully', txId });

  } catch (error) {
    console.error('Error in /send endpoint:', error.message);

    // Log failed transaction
    const newTransaction = new TransactionModel({
      userId: req.body.userId,
      fromAddress,
      toAddress,
      amount: req.body.amount * 1e8, // Convert to satoshis
      status: 'failed',
      createdAt: new Date(),
      error: error.message,
    });
    await newTransaction.save();

    res.status(500).json({ message: 'Error sending transaction', error: error.message });
  }
};
