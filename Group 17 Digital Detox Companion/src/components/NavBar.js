import React from "react";
import { Link } from "react-router-dom"; // If using React Router

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">Digital Detox Companion</div> {/* App Name */}
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/settings">Settings</Link>
      </div>
    </nav>
  );
};

export default Navbar;
