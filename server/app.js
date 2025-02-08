const express = require("express");
const app= express();
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/mongodb");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const indexRoutes = require("./routes/index.route");
const userRoutes = require("./routes/user.route");
const eventRoutes = require("./routes/event.route");
const Event = require("./models/event");
const userModel = require("./models/User");
const PORT = process.env.PORT || 4000;
const http = require("http");
const {Server} = require('socket.io'); 
const mongoose = require('mongoose');
// const { app, server } =require( "./lib/socket.js");
//To initialize a server
const server =  http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ['GET', 'POST'],
          credentials: true,
    },
  });

app.use(express.static('public'))
const allowedOrigins = ['http://localhost:3000']
app.use((req, res, next) =>{
    const origin = req.headers.origin;
    if(allowedOrigins.includes(origin)){
        res.setHeader('Access-Control-Allow-Origin', origin);
    }   
    res.header(
        'Access-Control-Allow-Methods', 
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next(); 
})
//MongoDb Connection
connectDB();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.use(
    fileUpload({
        useTempFiles:true,
		tempFileDir:"/tmp",
        limits: { fileSize: 50 * 1024 * 1024 }
	})
)
app.use("/", indexRoutes);
app.use("/user", userRoutes);
app.use("/event", eventRoutes);
//cloudinary connection
cloudinaryConnect();

io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('joinEvent', async ({ eventId, userid }) => {
        const event = await Event.findById(eventId);
        console.log('hello', eventId);
        console.log(event);
        if (event && !event.attendeesId.includes(new mongoose.Types.ObjectId(userid))) {
            event.attendees += 1;
            event.attendeesId.push(userid);
            await event.save();
            const user = await userModel.find({_id:{$in : event.attendeesId}});
          io.emit('attendeeUpdate', { eventId, attendees: event.attendees, attendeesId: event.attendeesId, userInfo: user });
        }
    });
  
    socket.on('leaveEvent', async ({ eventId, userid }) => {
        const event = await Event.findById(eventId);
        if (event && event.attendeesId.includes(userid)) {
          event.attendees -= 1;
          event.attendeesId = event.attendeesId.filter(id => id.toString() !== userid);
          await event.save();
          const user = await userModel.find({ _id: { $in: event.attendeesId } });
          io.emit('attendeeUpdate', { eventId, attendees: event.attendees, attendeeIds: event.attendeesId, userInfo: user});
        }
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
  


server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})
