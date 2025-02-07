import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// import io from "socket.io-client";
// import Footer from './Footer';
// import useStore from "../lib/useStore";
import backgroundImage from "../partials/image.jpg";
const UserDashboard = () => {
  const { id } = useParams();
  const location = useLocation();
  const apiUrl = window.location.hostname === 'localhost'
    ? "http://localhost:8000" : null;
  const navigate = useNavigate();
  // const socket = io("${apiUrl}", {
  //   transports: ['websocket'],
  // });
  const [user, setUser] = useState(null);
  const [date, setDate] = useState([]); 
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', date: '' });
  // const date = location.state?.date;
  // const category = location.state?.category;
  // const [joinMessage, setJoinMessage] = useState("");
  // const [isModalOpen, setIsModalOpen] = useState(false);
//   const { disconnectSocket } = useStore();
console.log("categories", categories);
  const userId = id.toString();
  let userData;

  const fetchUserData = async (id) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      if (!token) {
        toast.error('Please sign in.');
        return navigate('/signin');
      }

      const response = await axios.get(
        `${apiUrl}/user/dashboard/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setUser(response.data.user);
        userData = response.data.user;
      } else {
        toast.error("Failed to fetch user data.");
        setError("Failed to fetch user data.");
      }
    } catch (err) {
      if (err.response && err.response.status === 500) {
        toast.error(err.response?.data?.message || "An error occurred.");
        navigate("/signin");
      } else {
        toast.error(err.response?.data?.message || "An error occurred.");
      }
    }
  };
  useEffect(() => {
    fetchUserData(id);
    fetchEvents();
  }, [id, navigate]);

  // useEffect(() => {
  //   socket.on('notification', (notification) => {
  //     console.log(notification.message); // Handle the notification (e.g., show an alert or update UI)
  //   });

  //   return () => {
  //     socket.off('notification'); // Clean up socket listeners
  //   };
  // }, []);
  const fetchEvents = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      if (!token) {
        toast.error('Please sign in.');
        return navigate('/signin');
      }

      const response = await axios.get(
        `${apiUrl}/event/${id}`,
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
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        toast.error('Please sign in.');
        return navigate('/signin');
      }

      const response = await axios.post(
        `${apiUrl}/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        toast.success("Logout Successful")
        // disconnectSocket();
        // setTimeout(() => navigate(`/signin`), 1500);
        // setTimeout(() => navigate(`/dashboard/${user._id}`), 1500); // Redirect after 2 seconds

      } else {
        toast.error(response.data.message || "Logout failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred during logout.");
    }
  };

  const handleProfile = async (userId) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        toast.error('Please sign in.');
        return navigate('/signin');
      }



      const response = await axios.get(
        `${apiUrl}/user/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        navigate(`/profile/${userId}`, { state: { profile: response.data, userID: userId } });
      } else {
        toast.error("Failed to fetch profile data.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred during Profile view.");
    }
  }

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
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
              Welcome, {user.firstName}!
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
                <span className="font-semibold text-gray-100">Name:</span> {user.firstName} {user.lastName}
              </p>
              <p>
                <span className="font-semibold text-gray-100">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold text-gray-100">Member Since:</span>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
             
          <div className="mb-4 flex justify-between sm:justify-start">
            <button
              onClick={() => handleProfile(userId)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-auto"
            >
              View Profile
            </button>
            <button onClick={() => navigate('/create-event', {state: {userId:userId}})}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-auto">
               Create Event
            </button>
          </div>
          {/* Event Filters */}
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
            <div className="space-y-4">
              {filterEvents().map((event) => (
                <div key={event.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  <h3 className="font-semibold text-gray-100">{event.name}</h3>
                  <p>{event.description}</p>
                  <p className="font-semibold text-gray-100">Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p className="font-semibold text-gray-100">Category: {event.category}</p>
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

export default UserDashboard;
