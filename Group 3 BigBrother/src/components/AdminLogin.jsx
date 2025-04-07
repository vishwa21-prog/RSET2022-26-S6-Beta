import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // ✅ Hardcoded email and password check
    if (email === "admin123@example.com" && password === "password") {
      alert("Login successful! Redirecting...");
      navigate("/admin-feed"); // Redirect to AdminFeed after successful login
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 text-gray-900 p-6">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-6 text-gray-800 text-center drop-shadow-md">
        Admin Login
      </h2>

      {/* Login Box */}
      <div className="bg-white bg-opacity-30 p-8 rounded-2xl shadow-2xl backdrop-blur-lg w-96 flex flex-col gap-6">
        <input
          type="email"
          placeholder="Admin Email"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          className="p-3 bg-gray-600 text-white rounded-lg w-full font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
