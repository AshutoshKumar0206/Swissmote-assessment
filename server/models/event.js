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
    attendeesId:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[],
      }
    ],
    attendees:{
      type: Number,
      default:0,
    }
  });

  module.exports = mongoose.model('Event', eventSchema);