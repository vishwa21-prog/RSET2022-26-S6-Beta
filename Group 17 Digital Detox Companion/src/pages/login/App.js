import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import "./App.css";

function Home() {
  return (
    <div className="app-container">
      {/* Background Animation */}
      <motion.div
        className="background-animation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      ></motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="title"
      >
        <span className="gradient-text">Detox Companion</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="tagline"
      >
        Your Digital Buddy!!
      </motion.p>

      {/* Description */}
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

      {/* Buttons */}
      <motion.div
        className="buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <Link to="/login">
          <button className="btn">Login</button>
        </Link>
        <Link to="/signup">
          <button className="btn">Signup</button>
        </Link>
      </motion.div>
    </div>
  );
}

export default Home;