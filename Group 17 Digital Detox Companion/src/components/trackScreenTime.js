import { useEffect } from "react";
import { addLogToFirestore } from "../firebase";

const TrackScreenTime = () => {
  useEffect(() => {
    let activeApp = document.title; // Detect current tab's title
    let startTime = Date.now(); // Track start time

    const updateLog = () => {
      let endTime = Date.now();
      let duration = Math.floor((endTime - startTime) / 1000); // Convert to seconds
      
      if (duration > 0) {
        console.log(`Logging ${activeApp} for ${duration} seconds`);
        addLogToFirestore("test-user", activeApp, duration, "General");
      }
      startTime = Date.now(); // Reset start time
    };

    // Track time every 30 seconds
    const interval = setInterval(updateLog, 30000);

    return () => clearInterval(interval); // Cleanup when unmounted
  }, []);

  return <div>Tracking screen time...</div>;
};

export default TrackScreenTime;
