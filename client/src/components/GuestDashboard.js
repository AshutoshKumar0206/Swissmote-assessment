import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import backgroundImage from "../partials/image.jpg";
const GuestDashboard = () => {
  const location = useLocation();
  const apiUrl = window.location.hostname === 'localhost' ? 
  "http://localhost:8000" : process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [date, setDate] = useState([]); 
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', date: '' });

  useEffect(() => {
    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('guestToken');

      const response = await axios.get(
        `${apiUrl}/event/guestdashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      if (response.data.success) {
        setEvents(response.data.events);
        const eventCategory = response.data.events.map(event => event.category);
        setCategories(eventCategory);
        const eventDates = response.data.events.map(event => {
          const eventDate = new Date(event.date);
          return eventDate.toISOString().split('T')[0];
        });
          setDate(eventDates);
      } else {
        toast.error("Failed to fetch events.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred.");
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('guestToken');   
        toast.success("Logout Successful")
        navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred during logout.");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filterEvents = () => {
    let filteredEvents = events;
    console.log("Filtering events", filteredEvents); 

    if (filters.category) {
      filteredEvents = filteredEvents.filter(event => event.category === filters.category);
    }
    if (filters.date) {
      console.log(filters.date)
      filteredEvents = filteredEvents.filter(event => new Date(event.date).toISOString().split('T')[0] === filters.date);
    }

    return filteredEvents;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/signin")}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="min-h-screen bg-gray-900 text-gray-200" style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}>
        <ToastContainer position="top-center" autoClose={1500} />
        <div className="container mx-auto py-8 px-6">
          <div className="flex flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold text-center md:text-left">
              Welcome, Guest!
            </h1> 
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg w-auto"
            >
              Logout
            </button>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Details</h2>
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <p>
                <span className="font-semibold text-gray-100">Name:</span> Guest
              </p>
              <p>
                <span className="font-semibold text-gray-100">Email:</span> {"guest@gmail.com"}
              </p>
              <p>
                <span className="font-semibold text-gray-100">Member Since:</span>{" "}
                {new Date(Date.now()).toISOString().split('T')[0]}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Event Filters</h2>
            <div className="flex gap-4 mb-6">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="bg-gray-800 text-white p-2 rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="bg-gray-800 text-white p-2 rounded-md"
              />
            </div>
          </div>

          {/* Event List */}
            <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming and Past Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterEvents().map((event) => (
                <div key={event._id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 
                hover:bg-gray-600 transition-all duration-300 cursor-pointer">
                  <h3 className="font-semibold text-gray-100">Event Name: {event.name}</h3>
                  <p className="font-semibold text-gray-100 overflow-hidden">Description: {event.description}</p>
                  <p className="font-semibold text-gray-100">Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p className="font-semibold text-gray-100">Category: {event.category}</p>
                  <p className="font-semibold text-gray-100">CreatedBy: {event.createdBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div> 
      //{/* <Footer /> */}
  );
};

export default GuestDashboard;
