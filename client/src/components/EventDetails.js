import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import io from "socket.io-client";
import backgroundImage from "../partials/image.jpg";

const EventDetails = () => {
const { id } = useParams();
const location = useLocation();
const apiUrl = window.location.hostname === 'localhost' ? 
"http://localhost:8000" : process.env.REACT_APP_BASE_URL;
const navigate = useNavigate();
const socket = io(`${apiUrl}`);
const event = location.state?.event;
const [error, setError] = useState("");
const [events, setEvents] = useState(event);
const userId = location.state?.userId;

  useEffect(() => {
    const fetchEventDetails = async () => {
        try{
            const token = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("token="))
                    ?.split("=")[1];
            
            if (!token) {
                    toast.error('Please sign in.');
                    return navigate('/signin');
            }
            const response = await axios.get(`${apiUrl}/event/eventdetails/${event._id}`, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            if(response.data.success){
                setEvents((prevEvents)=> ({...prevEvents, attendeesId:response.data.attendeesId, 
                    attendees:response.data.attendees, userInfo: response.data.attendeesInfo}))
            } 
        } catch(err){
            toast.error(err.response?.data?.message || "An error occurred during fethching Event Details.");
           setError(err.response?.data?.message || "An error occurred during fethching Event Details.")
        }
    }
    socket.on('attendeeUpdate', ({ eventId, attendees, attendeesId, userInfo }) => {
        if(event._id === eventId){
            setEvents((prevEvents) =>
                ({ ...prevEvents, attendees, attendeesId, userInfo }));
        }
    });
    
    fetchEventDetails();
    return () => {
        socket.off('attendeeUpdate');
    };
}, [event._id, navigate]);

const joinEvent = (id, userId) => {
    socket.emit('joinEvent', { eventId: id, userid: userId });
    toast.success('A new User has joined the Event.');
};

const leaveEvent = (id, userId) => {
    socket.emit('leaveEvent', { eventId: id, userid: userId });
    toast.success('User has left the Event.');
};

return (
<div className="min-h-screen flex flex-col">
      <div className="min-h-screen bg-gray-900 text-gray-200" style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}>
        <ToastContainer position="top-center" autoClose={1500} />
        <div className="container mx-auto py-8 px-6 flex justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            Event Details
        </h1>
        <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
        >
            Back
        </button>
        </div> 
        <div className="mb-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <p>
                <span className="font-semibold text-blue-400">Name:</span> {events.name}
              </p>
              <p>
                <span className="font-semibold text-blue-400">Description:</span> {events.description}
              </p>
              <p>
                <span className="font-semibold text-blue-400">Category:</span>{" "}
                {events.category}
              </p>
              <p>
                <span className="font-semibold text-blue-400">CreatedAt:</span>{" "}
                {new Date(events.date).toLocaleDateString()}
              </p>
              <p><span className="font-semibold text-blue-400">Attendees:</span>{" "}
              {events.attendees}</p>
            </div>
          </div>
          <div className="flex justify-end gap-10 mb-6">
          <button onClick={() => joinEvent(events._id, userId)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 
        text-white font-bold rounded-lg transition">Join Event</button>
          <button onClick={() => leaveEvent(events._id, userId)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 
          text-white font-bold rounded-lg transition">Leave Event</button>
          </div>

          <div  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events && events.userInfo ? (
              events.userInfo.map((user, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 
                  hover:bg-gray-600 transition-all duration-300"
                >
                  <p className="text-lg font-semibold text-blue-400 mb-2 overflow-auto">
                    Name: {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-300">Email: {user.email}</p>
                  <p className="text-gray-300">Contact: {user.contact}</p>
                </div>
              ))
          ):(
            <p className="text-center col-span-full text-gray-400">No Attendees found.</p>
          )}
        </div>
        </div>
    </div>
);
};

export default EventDetails;