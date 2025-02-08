import React from "react";
import Header from "./Header";
import backgroundImage from '../partials/image.jpg';

const Home = () => {
  return (
    <div>
      <Header />
      <main
        className="min-h-screen flex flex-col items-center justify-center relative text-white py-12"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
      >
        <div className="absolute inset-0 bg-opacity-60"></div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl font-bold text-blue-400 mb-6">
            Welcome to the Event Management Portal! 
          </h1>
          <p className="text-xl text-gray-300 mb-8">
          Easily create and manage your events with our intuitive platform.<br/> 
          Upload and organize images, track attendees, and manage event details all in one place!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
