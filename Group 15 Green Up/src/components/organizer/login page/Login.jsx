import React, { useState } from "react";
import { supabase } from "../../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import bgimg from "../../../assets/Welcomebg.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

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

    const { data: organizer, error: organizerError } = await supabase
      .from("organizers")
      .select("email_id")
      .eq("email_id", email)
      .single();

    if (organizerError || !organizer) {
      setError("You are not registered as an organizer.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    alert("Login successful!");
    navigate("/organizenew");
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    console.log("Signing in with Google...");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e1e]">
      <div className="w-full h-1/2 flex items-center justify-center">
        <img src={bgimg} alt="Login Illustration" className="w-full h-full object-cover" />
      </div>

      <div className="bg-[#1e1e1e] flex flex-col items-center justify-center h-1/2 px-6">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-[#f5f5f5] text-center mt-8 mb-6">Welcome Back Organizer!</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-4 border border-[#e9ebed] rounded-lg bg-[#e9ebed] text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#aed36c] placeholder:text-[#6f6f6f]"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-4 border border-[#e9ebed] rounded-lg bg-[#e9ebed] text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#aed36c] placeholder:text-[#6f6f6f]"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#aed36c] hover:bg-[#98bf5a] text-[#1e1e1e] font-semibold py-3 rounded-lg transition duration-200"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-[#f5f5f5] mt-6 text-center">or</p>

          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full bg-transparent text-[#f5f5f5] border border-[#f5f5f5] py-3 rounded-lg mt-4 hover:text-[#aed36c] hover:border-[#aed36c] transition"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={24} />
            <span>Sign in with Google</span>
          </button>

          <div className="flex flex-col gap-4 text-center mt-6">
            <p className="text-[#f5f5f5]">
              Not yet a Member?{" "}
              <span
                className="text-[#aed36c] cursor-pointer font-semibold hover:underline"
                onClick={() => navigate("/organizersignup")}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
