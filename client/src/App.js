import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import useStore from './lib/useStore';
import Header from "./components/Header";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import OTPVerification from "./components/OTPVerification";
import BlankPage from "./components/BlankPage";
import EventDashboard from "./components/EventDashboard";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateEvent from "./components/CreateEvent";
import { ToastContainer, toast } from "react-toastify";
const App = () => {
  // const { monitorSocketConnection } = useStore();

  // useEffect(() => {
  //   monitorSocketConnection();
  // }, [monitorSocketConnection]);

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={1500} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/blank" element={<BlankPage />} />
        <Route path="/dashboard/:id" element={<EventDashboard />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="create-event" element={<CreateEvent />} />
        {/* <Route path="/contact" element={<ContactUs />} /> */}
        {/* <Route path="/chat-container" element={<ChatContainer />} /> */}
      
      </Routes>
    </Router>
  );
};

export default App;
