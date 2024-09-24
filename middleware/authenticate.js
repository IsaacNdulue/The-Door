const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
require('dotenv').config

exports.authenticateUser = async (req, res, next) => {
    try {
      // Extract the token from the request headers
      const hasAuthorization = req.headers.authorization;
  
      if (!hasAuthorization) {
        return res.status(401).json({ error: 'Authorization token is required' });
      }
  
      // Split the authorization header to get the token
      const token = hasAuthorization.split(" ")[1];
  
      // Verify the token
      const decoded = jwt.verify(token, process.env.jwtSecret);
  
      const user = await userModel.findById(decoded.userId);
  
      if (!user) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
  
      req.user = decoded; // Attach the user object to the request for further use
      next();
    } catch (error) {
      if(error instanceof jwt.JsonWebTokenError){
              return res.json({
                  message: "session Timeout"
              })
          }
      return res.status(401).json({ error:error.message });
    }
};

