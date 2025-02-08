import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import OTPVerification from "./components/OTPVerification";
import EventDashboard from "./components/EventDashboard";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateEvent from "./components/CreateEvent";
import { ToastContainer, toast } from "react-toastify";
import EventDetails from "./components/EventDetails";
import UpdateProfile from "./components/UpdateProfile";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import GuestDashboard from "./components/GuestDashboard";
const App = () => {

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={1500} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/otpverification" element={<OTPVerification />} />
        <Route path="/blank" element={<BlankPage />} />
        <Route path="/dashboard/:id" element={<EventDashboard />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="createevent" element={<CreateEvent />} />
        <Route path="/eventdetails/:id" element={<EventDetails />} />
        <Route path="/updateprofile/:id" element={<UpdateProfile />} />
        <Route path="/guestdashboard" element={<GuestDashboard />} />
      
      </Routes>
    </Router>
  );
};

export default App;
