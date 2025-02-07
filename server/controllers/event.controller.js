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
          userIds:[userId]
        });
    
        await newEvent.save();

        user.eventId.push(newEvent._id);
        await user.save();
        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully!' 
        });
      } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while creating Event'
        });
      }
}

module.exports.getEvents = async(req, res, next) => {
  try {
    const userId = req.params.id;
    const {category, date } = req.body;
    const user = await userModel.findById(userId).populate('eventId');
    if (!user) {
      return res.status(404).json({
        success:false,
        nessage:"User not found",
    });
    }
    const eventIds = user.eventId;
    const events = await Event.find({'_id':{$in:eventIds}});
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