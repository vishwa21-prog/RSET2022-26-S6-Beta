import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Import Supabase instance

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 🔹 Sign in with Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      alert("Login successful!");
      navigate("/user-feed");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-white p-6 bg-cover bg-center"
      style={{
        backgroundImage: "url('https://t4.ftcdn.net/jpg/05/82/99/01/360_F_582990159_cuO5tUymc5c6nVDWkNCbEPZCvQZGeqrU.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-4xl font-bold mb-8 text-white text-center drop-shadow-md">
          User Login
        </h2>

        <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl w-96 flex flex-col gap-6 text-gray-900">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 border border-gray-300 rounded-lg w-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="p-3 border border-gray-300 rounded-lg w-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="p-3 bg-purple-600 text-white rounded-lg w-full font-semibold hover:bg-purple-700 hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            className="p-3 bg-gray-500 text-white rounded-lg w-full font-semibold hover:bg-gray-600 hover:scale-105 transition-all duration-300 shadow-lg"
            onClick={() => navigate("/user-signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
