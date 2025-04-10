import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from '../components/Supabaseclient.tsx';

export default function SignUpPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleProfilePicChange = (event) => {
    setProfilePic(event.target.files[0]);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      // Sign up the user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw new Error("Signup failed! Try again.");
      
      // Upload profile picture if available
      let imageUrl = "";
      if (profilePic) {
        const filePath = `profiles/${Date.now()}-${profilePic.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from("profile")
          .upload(filePath, profilePic);
          
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("profile").getPublicUrl(filePath).data.publicUrl;
      }
      
      // Store user details in the database
      const { error: insertError } = await supabase.from("auth-domain").insert([
        {firstname, lastname, email, image: imageUrl, },
      ]);
      
      if (insertError) throw insertError;
      
      setMessage({ type: "success", text: "Signup successful! Redirecting..." });
      
      // Use window.location instead of navigate
      setTimeout(() => window.location.href = "/login", 2000);
      
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen bg-white px-10 relative">
      <div className="flex w-full max-w-4xl items-center justify-between gap-16">
        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg w-1/2 border border-blue-600 text-black"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-2xl font-bold text-center text-blue-500">Sign Up</h2>
          <p className="text-center text-gray-600 mb-4">Create an account to get started</p>

          {message.type === "error" && <p className="text-red-500 text-center mb-4">{message.text}</p>}
          {message.type === "success" && (
            <div className="bg-green-800 text-white p-3 rounded mb-4">
              <p className="text-center">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSignUp}>

          <div className="mb-4">
              <label className="block text-gray-700">firstname</label>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="Enter your firstname"
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-gray-800 border-gray-400"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">lastname</label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Enter your lasttname"
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-gray-800 border-gray-400"
                required
                disabled={loading}
              />
            </div>

            
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-gray-800 border-gray-400"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-gray-800 border-gray-400"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Profile Picture</label>
              <input
                type="file"
                onChange={handleProfilePicChange}
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-gray-800 border-gray-400"
                accept="image/*"
                disabled={loading}
              />
            </div>

    

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Already have an account? <a href="/login" className="text-blue-500 font-bold">Login</a>
          </p>
        </motion.div>

        <motion.h1
          className="text-6xl font-extrabold text-blue-500 w-1/2 text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Ready to Connect with the World? Sign Up Now!
        </motion.h1>
      </div>

      {/* Background Styling */}
      <style jsx>{`
        .container {
          width: 100%;
          height: 100vh;
          background: white;
          --gap: 5em;
          --line: 1px;
          --color: rgba(0, 0, 0, 0.1);
          background-image: linear-gradient(
              -90deg,
              transparent calc(var(--gap) - var(--line)),
              var(--color) calc(var(--gap) - var(--line) + 1px),
              var(--color) var(--gap)
            ),
            linear-gradient(
              0deg,
              transparent calc(var(--gap) - var(--line)),
              var(--color) calc(var(--gap) - var(--line) + 1px),
              var(--color) var(--gap)
            );
          background-size: var(--gap) var(--gap);
        }
      `}</style>
    </div>
  );
}