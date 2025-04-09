import React, { useState, useEffect } from "react";
import { supabase } from "./../../services/supabaseClient";
import "./../organizer/Login.css"; // Keeping the same styling as your Login.jsx

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (!isLogin) {
      getLocation();
    }
  }, [isLogin]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: `${position.coords.latitude}, ${position.coords.longitude}`,
          }));
        },
        () => console.log("Location access denied")
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) alert(error.message);
      else onClose();
    } else {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            location: formData.location,
          },
        },
      });
      if (error) alert(error.message);
      else onClose();
    }
  };

  return isOpen ? (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? "Welcome Back!" : "Join Us Today!"}</h2>
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isLogin && (
            <>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className="input-field"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <p className="location-text">
                {formData.location ? `Location: ${formData.location}` : "Fetching location..."}
              </p>
            </>
          )}
          <button type="submit" className="login-button">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="signup-text">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <span className="signup-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  ) : null;
};

export default AuthModal;
