const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({ 
    name: {
      type:  String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date:{ 
    type: Date,
    required: true,
    },
    time: {
     type: String,
     required: true,
    },
    category: {
     type: String,
     required: true,
    },
    userIds:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
      }
    ]
  });

  module.exports = mongoose.model('Event', eventSchema);