import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../components/Supabaseclient.tsx"; // Ensure the path is correct

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Step 1: Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error("Invalid email or password!");

      // Step 2: Check if the user exists in the 'auth-domain' table
      const { data: domainData, error: domainError } = await supabase
        .from("auth-domain")
        .select("*")
        .eq("email", email)
        .single();

      if (domainError && domainError.code !== "PGRST116") {
        throw new Error("User authentication failed!");
      }

      // Store user data in localStorage with proper column names
      if (domainData) {
        localStorage.setItem("userFirstName", domainData.firstname || "");
        localStorage.setItem("userLastName", domainData.lastname || "");
        localStorage.setItem("userEmail", email);
        console.log("User data stored:", domainData); // Debug log
      }

      console.log("✅ Verified");
      console.log("User data:", domainData);

      // Show success message
      setMessage({ type: "success", text: "Sign-in successful!" });

      // Redirect to contacts after delay
      setTimeout(() => {
        window.location.href = "/contacts";
      }, 2000);

    } catch (err) {
      console.error("Login error:", err);
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen px-10 relative bg-white">
      <div className="flex w-full max-w-4xl items-center justify-between mt-16">
        <motion.h1
          className="text-6xl font-extrabold text-blue-600 w-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Glad to see you again! Let's break language barriers together!
        </motion.h1>

        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg w-1/2 border border-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-2xl font-bold text-center text-blue-500">Login</h2>
          <p className="text-center text-gray-600 mb-4">Enter your credentials to continue</p>

          {/* Notification Popup */}
          {message.text && (
            <div
              className={`p-2 text-center rounded-md mb-4 ${
                message.type === "success" ? "bg-green-500" : "bg-red-500"
              } text-white`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-gray-900 border-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-gray-900 border-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account? <a href="/signup" className="text-blue-500 font-bold">Sign up</a>
          </p>
        </motion.div>
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
