import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addLogToFirestore } from "../firebase"; // Ensure correct path

const Dashboard = () => {
  const userId = "test-user";
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    console.log("📌 Dashboard Loaded: Starting Auto Logging...");
    addLogToFirestore(userId, "Dashboard", 0, "App Usage");

    // ✅ Timer: Starts counting when the dashboard loads
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer); // ✅ Cleanup on unmount
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        Dashboard
      </h1>

      {/* ✅ Styled Timer */}
      <p className="text-2xl mt-6 font-semibold text-gray-300">
        ⏳ Time Spent: <span className="text-blue-400">{elapsedTime} seconds</span>
      </p>

      <div className="flex justify-center gap-4 mt-6">
        <button 
          onClick={() => navigate("/daily-stats")} 
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-pink-700
text-white font-semibold rounded-full shadow-lg 
hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 
transition-all duration-300 ease-in-out"
        >
          Daily Stats
        </button>
        <button 
          onClick={() => navigate("/weekly-stats")} 
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-pink-700 
text-white font-semibold rounded-full shadow-lg 
hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 
transition-all duration-300 ease-in-out"
        >
          Weekly Stats
        </button>
        <button 
          onClick={() => navigate("/monthly-stats")} 
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-pink-700 
text-white font-semibold rounded-full shadow-lg 
hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 
transition-all duration-300 ease-in-out"
        >
          Monthly Stats
        </button>
        
      <button onClick={() => navigate("/mood")}className="px-8 py-4 bg-gradient-to-r from-blue-500 to-pink-700 
text-white font-semibold rounded-full shadow-lg 
hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 
transition-all duration-300 ease-in-out">Go to Mood Tracker</button>
      </div>
    </div>
  );
};

export default Dashboard;
