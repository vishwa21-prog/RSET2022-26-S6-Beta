import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/login/App"
import Login from "./pages/login/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import ScreenTimeTracker from "./components/screenTimeTracker";  
import ScreenTimeStats from "./components/screenTimeStats";  
import Navbar from "./components/NavBar";
import DailyStats from "./pages/DailyStats";
import WeeklyStats from "./pages/WeeklyStats";
import MonthlyStats from "./pages/MonthlyStats";
import TrackScreenTime from "./components/trackScreenTime";
import MoodTracker from "./pages/MoodTracker";
import { addLogToFirestore } from "./pages/firebase"; 

const userId = "test-user";

function App() {
  useEffect(() => {
    // ✅ Test log when app starts
    addLogToFirestore(userId, "TestApp", 120, "Debugging")
      .then(() => console.log("✅ Log added successfully!"))
      .catch((error) => console.error("❌ Error logging data:", error));
  }, []);  

  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <>
              <Dashboard />
              <ScreenTimeStats /> 
              <TrackScreenTime />
            </>
          } />
          <Route path="/settings" element={<Settings />} />
          <Route path="/screen-time" element={<ScreenTimeTracker userId={userId} />} />  
          <Route path="/daily-stats" element={<DailyStats />} />
          <Route path="/weekly-stats" element={<WeeklyStats />} />
          <Route path="/monthly-stats" element={<MonthlyStats />} />
          <Route path="/mood" element={<MoodTracker />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
