import React from "react";
import Header from "./Header";
// import Footer from './Footer';
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
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl font-bold text-blue-400 mb-6">
            Welcome to the Home Page!
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            This site allows you manage and create Events!
          </p>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
