import React, { useState } from "react";
import { supabase } from "./../../../services/supabaseClient.jsx"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "volunteer", // Default role
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the Terms & Conditions to sign up.");
      return;
    }

    setLoading(true);
    setError("");

    const { email, password, name, phone, role } = formData;

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, name, phone },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Signup successful! Check your email to verify your account.");

      // Insert into participants table if role is volunteer
      if (role === "volunteer" && data.user) {
        const { error: insertError } = await supabase.from("participants").insert([
          {
            id: data.user.id,
            name,
            email_id: email,
            phone_number: phone,
          },
        ]);

        if (insertError) {
          console.error("Error inserting participant:", insertError);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-800">
  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 className="text-2xl font-bold text-green-700 text-center">Be a Volunteer Now!</h2>
    <form onSubmit={handleSubmit} className="text-black mt-4">
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        className="w-full p-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 
                   focus:ring-green-500 placeholder:text-green-700 text-black"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full p-3 mt-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 
                   focus:ring-green-500 placeholder:text-green-700 text-black"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full p-3 mt-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 
                   focus:ring-green-500 placeholder:text-green-700 text-black"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        className="w-full p-3 mt-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 
                   focus:ring-green-500 placeholder:text-green-700 text-black"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <label className="flex items-center mt-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mr-2"
        />
        <span className="text-green-700">I agree to Terms & Conditions</span>
      </label>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button
        type="submit"
        className="w-full bg-green-600 text-white p-3 rounded-lg mt-4 hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
    <p className="text-center text-green-700 mt-3">
      Already a Member?{" "}
      <span className="text-green-500 cursor-pointer font-semibold hover:underline" onClick={() => navigate("/userlogin")}>
        Login
      </span>
    </p>
  </div>
</div>
  );
};    
export default Signup;
