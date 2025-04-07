import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Import Supabase client

export default function AuthoritySignup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!name || !phone || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Store data in Supabase
      const { data, error } = await supabase
        .from("authorities")
        .insert([{ name, phone, email, password }]); // Consider hashing password

      if (error) throw error;

      alert("Signup successful! Waiting for approval");
      navigate("/authority-login"); // Redirect after successful signup
    } catch (err) {
      alert(`Signup failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-200 via-blue-100 to-green-200 text-gray-900 p-6">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-6 text-indigo-800 text-center drop-shadow-md">
        Authority Signup
      </h2>

      {/* Signup Box */}
      <div className="bg-white bg-opacity-30 p-8 rounded-2xl shadow-2xl backdrop-blur-lg w-96 flex flex-col gap-6">
        <input
          type="text"
          placeholder="Name"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Signup Button */}
        <button
          className="p-3 bg-indigo-500 text-white rounded-lg w-full font-semibold hover:bg-indigo-600 hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
