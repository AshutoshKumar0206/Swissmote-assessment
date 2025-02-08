const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact:{
    type: String,
    default: "XXXXXXXXXX"
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
  },
  eventId:[
    {
      type: mongoose.Schema.Types.ObjectId,
    }
  ],
  role:{
    type:String,
    enum:['guest', 'user']
  }
});

module.exports = mongoose.model('User', UserSchema);
