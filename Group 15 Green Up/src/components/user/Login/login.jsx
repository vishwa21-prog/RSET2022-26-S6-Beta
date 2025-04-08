import React, { useState } from "react";
import { supabase } from "./../../../services/supabaseClient.jsx"; // Adjust the path if needed
import { useNavigate } from "react-router-dom";
import bgimg from "../../../assets/Welcomebg.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password } = formData;

    // Step 1: Attempt to log in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Please verify your email before logging in.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    // Step 2: Check if email exists in the 'participants' table
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("email_id")
      .eq("email_id", email)
      .single();

    if (participantError || !participant) {
      setError("You are not registered as a participant.");
      await supabase.auth.signOut(); // Sign out if email is not found
      setLoading(false);
      return;
    }

    // Step 3: Proceed to events page if email exists in 'participants'
    alert("Login successful!");
    navigate("/events");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e1e]">
      {/* Image at the top */}
      <div className="w-full h-1/2 flex items-center justify-center">
        <img src={bgimg} alt="Login Illustration" className="w-full h-full object-cover" />
      </div>

      {/* Login Form filling the bottom half with dark background */}
      <div className="bg-[#1e1e1e] p-8 rounded-t-lg shadow-lg w-full flex flex-col justify-center items-center h-1/2">
        <div className="w-96 flex flex-col gap-10"> {/* More spacing between components */}
          <h2 className="text-2xl font-bold text-[#f5f5f5] text-center">Welcome Back!</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6"> {/* More spacing between form elements */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 border border-[#e9ebed] rounded-lg bg-[#e9ebed] text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#aed36c] placeholder:text-[#6f6f6f]"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 border border-[#e9ebed] rounded-lg bg-[#e9ebed] text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#aed36c] placeholder:text-[#6f6f6f]"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#aed36c] text-[#1e1e1e] p-3 rounded-lg hover:bg-[#98bf5a] transition"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="flex flex-col gap-4 text-center"> {/* Increased spacing */}
            <p className="text-[#f5f5f5]">
              Not yet a Member?{" "}
              <span
                className="text-[#aed36c] cursor-pointer font-semibold hover:underline"
                onClick={() => navigate("/usersignup")}
              >
                Sign Up
              </span>
            </p>
            <p className="text-[#f5f5f5]">
              Are you an Organizer?{" "}
              <span
                className="text-[#aed36c] cursor-pointer font-semibold hover:underline"
                onClick={() => navigate("/organizerlogin")}
              >
                Click here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
