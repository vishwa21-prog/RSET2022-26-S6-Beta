import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.svg";

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home"); // Change "/home" to your actual homepage route
    }, 4000);

    return () => clearTimeout(timer); // Cleanup function to prevent memory leaks
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#1e1e1e]">
      <motion.img
        src={logo}
        alt="GreenUp Logo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="max-w-full h-auto"
      />
    </div>
  );
}

export default SplashScreen;
