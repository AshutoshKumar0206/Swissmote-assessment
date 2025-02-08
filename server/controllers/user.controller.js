const userModel = require("../models/User");
const jwt = require("jsonwebtoken");
const notConfirmedModel = require("../models/notConfirmed");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const OTP = require("../models/Otp");
const emailTemplate = require("../mail/emailVerificationTemplate");
const resetTemplate = require("../mail/resetPassOtp")
const mailSender = require("../utils/mailsender");
const passwordUpdateTemplate = require("../mail/PasswordUpdate");
const mongoose = require('mongoose');
const { uploadImageToCloudinary } = require('../utils/imageUploader') 
require('dotenv').config();

module.exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@, #, $, %, ^, &, *).",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match.",
      });
    }

    const isUserAlreadyExist = await userModel.findOne({ email });

    if (isUserAlreadyExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new notConfirmedModel({
      firstName,
      lastName,
      email,
      password: hashedPassword, 
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      newUser,
      message: "Signup successful",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
module.exports.signinGuest = async (req, res, next) => {
  try {
    const guestPayload = {
      role: 'guest',
      createdAt: Date.now(),
    };
    const token = jwt.sign(guestPayload, 'your_secret_key', { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

  const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    } else if (isPasswordCorrect) {
      const token = jwt.sign({email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

      user.token = token;
      user.password = undefined;
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    
    const checkUserPresent = await userModel.findOne({ email: email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }

    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    const mailResponse = await mailSender(
      email,
      "Verification email",
      emailTemplate(otp)
    )
    console.log("mail response:", mailResponse);

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};


module.exports.verifyotp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        success: false,
        message: "OTP and email are required",
      });
    }

    const otpEntry = await OTP.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    const currUser = await notConfirmedModel.findOne({ email });
    if (!currUser) {
      return res.status(404).json({
        message: "User not found in notConfirmed list.",
      });
    }

    const approvedUser = new userModel({
      firstName: currUser.firstName,
      lastName: currUser.lastName,
      email: currUser.email,
      password: currUser.password,    
    });

    await approvedUser.save();
    await notConfirmedModel.findByIdAndDelete(currUser._id);
    await OTP.deleteOne({ email, otp });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. User moved to pending list.",
    });
  } catch (err) {
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
  }
    res.status(200).json({
      message: "User Logged out",
    });
  } catch (err) {
    next(err);
  }
};

module.exports.sendresetpasswordotp = async (req, res) => {
  try {
    const { email } = req.body;

    const checkUserPresent = await userModel.findOne({ email: email });

    if (!checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is not Registered`,
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }

    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    const mailResponse = await mailSender(
      email,
      "Verification email",
      resetTemplate(otp)
    )

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
	try {
		const { password, confirmPassword, otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        success: false,
        message: "OTP and email are required",
      });
    }

    const otpEntry = await OTP.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@, #, $, %, ^, &, *).",
      });
    }

		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password does not Match",
			});
		}
		const userDetails = await userModel.findOne({ email: email });
		if (!userDetails) {
			return res.json({
				success: false,
				message: "User is not Registered",
			});
		}
		
		const encryptedPassword = await bcrypt.hash(password, 10);
		await userModel.findOneAndUpdate(
			{ email: email },
			{ password: encryptedPassword },
			{ new: true }
		);
    const mailResponse = await mailSender(
      userDetails.email,
      `Password Reset email`,
      passwordUpdateTemplate(userDetails.email, userDetails.firstName, userDetails.lastName)
    )
		res.json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};

module.exports.dashboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    if(id !== req.user.id){
      return res.status(404).send({
        success: false,
        message: 'User is unauthorized to check other persons data'
      })
    } else if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const user = await userModel
    .findById(id)
    .select("-password")
    
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User not found",
      });
    }


    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
      },
      success: true,
    });
  } catch (err) {

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

  }
};

module.exports.getProfile = async (req, res, next) => {
  try {
    let userId = req.params.id;
    userId = new mongoose.Types.ObjectId(userId);

    const user = await userModel.findById(userId).select("firstName lastName image");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Profile",
      name: `${user.firstName} ${user.lastName}`,
      image: user.image,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching User Profile",
    });
  }
};

module.exports.Profile = async (req, res, next) => {
  let userId = req.params.id;
  try{
    if(userId !== req.user.id){
      return res.status(404).send({
        success: false,
        message: 'User is unauthorized to check other persons data'
      })
    }
      userId = new mongoose.Types.ObjectId(userId); 
      const user = await userModel.findById(userId).select("-password -subjects");
      if(!user){
          res.status(404).json({
            success: false,
            message: "User not found",
          })
      }
      res.status(200).json({
        success: true,
        message: "User Profile",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        contact: user.contact,
        image: user.image,
      })

  }catch(err){
    res.status(500).json({ 
      success: false,
      message: "Error fetching User Profile",
    });
  }
}

module.exports.updateProfile = async (req, res, next) => {
  let userId = req.params.id;

  if(userId !== req.user.id){
    return res.status(404).send({
      success: false,
      message: 'User is unauthorized to check other persons data'
    })
  } if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(200).json({
      success: false,
      message: "Invalid user ID",
    });
  }
  userId = new mongoose.Types.ObjectId(userId);
  let email = req.body.email;
  let firstName = req.body.profileInput.firstName;
  let lastName = req.body.profileInput.lastName;
  let contact  = req.body.profileInput.contact;
  
  try{
    const user = await userModel.findById(userId).select("-password");
    let updatedUser;
    if(user.role == "student") {
      updatedUser = await userModel.findByIdAndUpdate(userId, { email, firstName : firstName, lastName : lastName, 
        rollNo, contact, 
       section, branch, 
        semester}, {new: true}).select("-password");
    } else {
      updatedUser = await userModel.findByIdAndUpdate(userId, { email, firstName : firstName, lastName : lastName, 
         contact}, {new: true}).select("-password");
    }
    if(!updatedUser){
      res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User Profile Updated Successfully",
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      contact: updatedUser.contact,
      role: updatedUser.role,
      image: updatedUser.secure_url,
    })
  } catch(err){
      res.status(500).json({ 
        success: false, 
        message: "Error updating User Profile", 
      });
  }  
}
module.exports.updateDisplayPicture = async (req, res, next) => {
 let userId = req.params.id;
try{
  if(userId !== req.user.id){
    return res.status(404).send({
      success: false,
      message: 'User is unauthorized to check other persons data'
    })
  } else if (!req.files || !req.files.displayPicture) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }
  
  const displayPicture = req.files.displayPicture;
  userId = new mongoose.Types.ObjectId(userId);
  const image = await uploadImageToCloudinary(
    displayPicture,
    process.env.FOLDER_NAME,
    1000,
    1000
  )
  const updatedProfile = await userModel.findByIdAndUpdate(
    userId,
    { image: image.secure_url },
    { new: true }
  )
  res.send({
    success: true,
    message: `Image Updated successfully`,
    data: updatedProfile,
  })
} catch(err){
    return res.status(500).json({
      success: false,
      message: err.message,
    }) 
}
}
