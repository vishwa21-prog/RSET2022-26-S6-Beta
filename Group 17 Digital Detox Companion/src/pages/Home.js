import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Home.css";
import bgImage from "../assets/Looper BG.png"; // ✅ Background image is now used properly

const Home = () => {
  return (
    <div className="home-container">
      {/* Background Image */}
      <div
        className="background-animation"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Title Section */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="title"
      >
        <span className="gradient-text">Detox Companion</span>
      </motion.h1>

      {/* Subtitle - Now correctly aligned */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="tagline"
      >
        your digital buddy!!
      </motion.p>

      {/* Description - Proper Spacing */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="description"
      >
        Your guide to a balanced, screen-free lifestyle. <br />
        Explore tips, strategies, and expert advice to help you disconnect,
        recharge, and reclaim your time.
      </motion.p>

      {/* Buttons - Proper Alignment & Gradient Border */}
      <motion.div
        className="buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <Link to="/about">
          <button className="btn">About us</button>
        </Link>
        <Link to="/login">
          <button className="btn">Login</button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;
