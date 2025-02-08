const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Event = require('../models/event');
const userModel = require('../models/User');
module.exports.createEvent = async(req, res, next) => {
    try {

        const name = req.body.eventDetails.name;
        const description = req.body.eventDetails.description;
        const date = req.body.eventDetails.date;
        const time = req.body.eventDetails.time;
        const category = req.body.eventDetails.category;
        const userId = req.body.userId;

        if (!name || !description || !date || !time || !category) {
          return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
          res.status(404).json({
            success:false,
            message:"User not found"
          });                                  
        }

        const newEvent = new Event({
          name,
          description,
          date,
          time,
          category,
          attendeesId: [],
          attendees:0,
          createdBy: user.firstName + " " + user.lastName
        });
    
        await newEvent.save();

        user.eventId.push(newEvent._id);
        await user.save();
        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully!' 
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while creating Event'
        });
      }
}

module.exports.getAllEvents = async(req, res, next) => {
  try {

    const events = await Event.find();
    if (!events || events.length === 0) {
      return res.status(404).json({
          success: false,
          message: "No events found for this user"
      });
    }
    res.status(200).json({ 
      success: true, 
      message:"Event Fetched Successfully!",
      events,
    });
  } catch (err) {
    res.status(500).json({ 
      success:false, 
      message: 'An error occurred while fetching events', 
    });
  }
};

module.exports.getEvent = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const event = await Event.findById(req.params.id).populate('attendeesId', 'attendees');
    if (!event) {
      return res.status(404).json({ 
        success:false, 
        message: 'Event not found' 
      });
    }
    const attendeesInfo = await userModel.find({ _id: { $in: event.attendeesId.map(attendee => attendee._id) } });
    res.status(200).json({ 
      success:true,
      message: 'Event fetched successfully',
      ...event._doc, 
      attendeesInfo, 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success:false, 
      message: 'Internal Server error' });
  }
}

module.exports.dashboard = async (req, res, next) => {
  try {
    const id = req.user.id;
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
const events = await Event.find();
   if(!events){
    res.status(404).json({
      success: false,
      message: "Event not found",
    })
   }
    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
      },
      events,
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

module.exports.guestDashboard = async (req, res, next) => {
  try{
    const events = await Event.find();
    res.status(200).json({
      events,
      success: true,
    });
  } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
}
}