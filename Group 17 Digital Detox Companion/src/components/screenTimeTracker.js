import React, { useEffect, useState } from "react";
import { addLogToFirestore } from "../firebase";

const ScreenTimeTracker = ({ userId = "test-user", appName = "Digital Detox" }) => {
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden or closed → Log time
        const elapsedTime = Math.round((Date.now() - startTime) / 1000);
        addLogToFirestore(userId, "Tab Closed", elapsedTime, appName);
        console.log("🚨 Tab Closed: Logged", elapsedTime, "seconds");
      } else {
        // Tab is active → Restart timer
        setStartTime(Date.now());
        console.log("✅ Tab Opened: Restarting timer");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startTime, userId, appName]);

  return null; // No UI needed, just tracking
};

export default ScreenTimeTracker;
