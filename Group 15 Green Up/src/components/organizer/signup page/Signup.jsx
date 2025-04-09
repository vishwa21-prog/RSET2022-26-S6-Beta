import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabaseClient"; // Adjust path if needed

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "organizer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("You must agree to the Terms & Conditions to sign up.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { email, password, name, phone, role } = formData;

    // Sign up user with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, name, phone },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      alert("Signup successful! Check your email to verify your account.");
      
      if (data.user) {
        const { error: insertError } = await supabase.from("organizers").insert([
          {
            id: data.user.id,
            name,
            email_id: email,
            phone_number: phone,
          },
        ]);

        if (insertError) {
          console.error("Error inserting organizer:", insertError);
        }
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Be an Organizer Now!</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full p-2 mb-2 border rounded"
      />
      
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full p-2 mb-2 border rounded"
      />
      
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full p-2 mb-2 border rounded"
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        className="w-full p-2 mb-2 border rounded"
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        required
        className="w-full p-2 mb-2 border rounded"
      />

      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} />
        <span>I agree to the Terms & Conditions</span>
      </label>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white p-2 mt-4 rounded hover:bg-green-700 transition"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <p className="mt-2 text-center">
        Already a Member? <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/organizerlogin")}><u>Click Here</u></span>
      </p>
      <p className="mt-1 text-center">
        Are you a Volunteer? <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/userlogin")}><u>Click Here</u></span>
      </p>
    </form>
  );
};

export default Signup;
