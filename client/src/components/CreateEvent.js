import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {useNavigate, useLocation} from "react-router-dom";
import backgroundImage from "../partials/image.jpg";
const CreateEvent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const apiUrl = window.location.hostname === 'localhost' ? 
  "http://localhost:8000" : process.env.REACT_APP_BASE_URL;
  const [eventDetails, setEventDetails] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    category: "",
  });
  const [error, setError] = useState("");
  const userId = location.state?.userId;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        
        const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
        
        if (!token) {
            toast.error('Please sign in.');
            return;
        }
        if (!eventDetails.name || !eventDetails.description || !eventDetails.date || !eventDetails.time || !eventDetails.category) {
          setError("Please fill in all fields.");
          return;
        }

      const response = await axios.post(
        `${apiUrl}/event/create`,
        {eventDetails, userId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      if (response.data.success) {
        toast.success("Event created successfully!");
        setEventDetails({ name: "", description: "", date: "", time: "", category: "" });
        navigate(`/dashboard/${userId}`, {state:{category: response.data.category, date: response.data.date}})
      } else {
        toast.error("Failed to create event.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred while creating the event.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <ToastContainer position="top-center" autoClose={1500} />
        <h2 className="text-2xl font-bold text-center mb-6">Create Event</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block font-semibold text-gray-200">
              Event Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={eventDetails.name}
              onChange={handleInputChange}
              className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block font-semibold text-gray-200">
              Event Description
            </label>
            <textarea
              id="description"
              name="description"
              value={eventDetails.description}
              onChange={handleInputChange}
              className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="block font-semibold text-gray-200">
              Event Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={eventDetails.date}
              onChange={handleInputChange}
              className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="time" className="block font-semibold text-gray-200">
              Event Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={eventDetails.time}
              onChange={handleInputChange}
              className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block font-semibold text-gray-200">
              Event Category
            </label>
            <select
              id="category"
              name="category"
              value={eventDetails.category}
              onChange={handleInputChange}
              className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
              required
            >
              <option value="">Select Category</option>
              <option value="Music">Music</option>
              <option value="Sports">Sports</option>
              <option value="Tech">Tech</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div className="mb-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
