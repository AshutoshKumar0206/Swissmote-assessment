const userModel = require("../models/User");
const jwt = require("jsonwebtoken");

// Configuring dotenv to load environment variables from .env file
require('dotenv').config();
module.exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    // console.log(token);
    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ success: false, message: "Token is invalid" });
    }
    
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }
      
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while validating the token",
      });
    }
  };

  module.exports.isGuestAuthenticated = async(req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  return next();
  }
  
