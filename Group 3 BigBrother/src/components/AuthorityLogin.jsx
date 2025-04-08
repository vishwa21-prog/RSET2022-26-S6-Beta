import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Import Supabase client

export default function AuthorityLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("⚠️ Please enter both email and password.");
      return;
    }

    setLoading(true);

    // Fetch user details from Supabase
    const { data, error } = await supabase
      .from("authorities")
      .select("id, email, password, approved") // Fetch password for validation
      .eq("email", email)
      .single();

    if (error || !data) {
      alert("Login failed. Incorrect email or account does not exist.");
    } else if (!data.approved) {
      alert("Your account is pending approval. Please wait for admin verification.");
    } else if (data.password !== password) {
      alert("Incorrect password. Please try again.");
    } else {
      // Successful login
      alert("Login successful!");
      localStorage.setItem("authority_id", data.id); // Store authority ID
      navigate("/authority-feed"); // Redirect to authority dashboard
    }

    setLoading(false);
  };


  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-white p-6"
      style={{
        backgroundImage: `url('https://nlcbharat.org/wp-content/uploads/2024/03/Embracing-%E2%80%98Maximum-Governance-Minimum-Government-Indias-Unique-Approach.jpeg')`, // Background Image
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay for contrast
      }}
    >
      {/* Title */}
      <h2 className="text-4xl font-bold mb-6 text-white text-center drop-shadow-md">
        🏛️ Authority Login
      </h2>

      {/* Login Box */}
      <div className="bg-white bg-opacity-30 p-8 rounded-2xl shadow-2xl backdrop-blur-lg w-96 flex flex-col gap-6">
        {/* Error Message */}
        {errorMessage && <p className="text-red-600 text-center font-medium">{errorMessage}</p>}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Enter your password"
          className="p-3 border border-gray-300 rounded-lg w-full bg-white bg-opacity-80 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          className="p-3 bg-indigo-500 text-white rounded-lg w-full font-semibold hover:bg-indigo-600 hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Signup Button */}
        <button
          className="p-3 bg-gray-500 text-white rounded-lg w-full font-semibold hover:bg-gray-600 hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={() => navigate("/authority-signup")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
