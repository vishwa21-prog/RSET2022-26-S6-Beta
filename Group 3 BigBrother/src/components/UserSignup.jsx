import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Import Supabase instance

export default function UserSignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!name || !email || !phone || !address || !dob || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // 🔹 Step 1: Sign up user with Supabase Auth (handles password)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 🔹 Step 2: Get the newly created user's ID from Supabase Auth
      const userId = data?.user?.id;
      if (!userId) throw new Error("User ID not found. Check email verification.");

      // 🔹 Step 3: Store additional user details in "users" table
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: userId, // Ensure UUID format matches Supabase Auth
          name,
          email,
          phone,
          address,
          dob,
        },
      ]);

      if (dbError) throw dbError;

      alert("Account created successfully! Check your email to verify.");
      navigate("/user-feed"); // Redirect after successful signup
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-200 via-blue-100 to-purple-200 text-gray-900 p-6">
      <h2 className="text-4xl font-bold mb-6 text-green-800 text-center drop-shadow-md">
        User Sign Up
      </h2>
      <div className="bg-white bg-opacity-30 p-8 rounded-2xl shadow-2xl backdrop-blur-lg w-96 flex flex-col gap-6">
        <input type="text" placeholder="Full Name" className={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" className={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="tel" placeholder="Phone Number" className={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="text" placeholder="Address" className={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} />
        <input type="date" placeholder="Date of Birth" className={inputStyle} value={dob} onChange={(e) => setDob(e.target.value)} />
        <input type="password" placeholder="Password" className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" className={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button className="p-3 bg-green-500 text-white rounded-lg w-full font-semibold hover:bg-green-600 hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={handleSignUp} disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

// ✅ Tailwind Utility Class for Input Styling
const inputStyle = "p-3 border border-gray-300 rounded-lg w-full bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all";
