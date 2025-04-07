import { useEffect, useState } from "react";
import { db } from "../firebase"; // Ensure Firebase is initialized
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

const useScreenTimeTracker = (userId) => {
  const [startTime, setStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem("startTime");
    return savedStartTime ? new Date(parseInt(savedStartTime)) : null;
  });

  const [totalScreenTime, setTotalScreenTime] = useState(0);

  // 🔵 Sync with Firestore in real-time
  useEffect(() => {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, `users/${userId}/screenTimeLogs`, today);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTotalScreenTime(docSnap.data().totalTime);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 🔵 Handle screen time tracking
  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = async () => {
      const now = new Date();

      if (document.visibilityState === "visible") {
        setStartTime(now);
        localStorage.setItem("startTime", now.getTime()); // ✅ Store start time
      } else {
        if (startTime) {
          const duration = Math.floor((now - startTime) / 1000); // Convert to seconds
          setTotalScreenTime((prev) => {
            const newTotal = prev + duration;
            updateScreenTime(userId, newTotal);
            return newTotal;
          });
          localStorage.removeItem("startTime"); // ✅ Remove when tab is hidden
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, startTime]);

  return formatTime(totalScreenTime);
};

// 🔵 Update Firestore with new screen time
const updateScreenTime = async (userId, totalTime) => {
  if (!userId) return;

  const today = new Date().toISOString().split("T")[0];
  const docRef = doc(db, `users/${userId}/screenTimeLogs`, today);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, { totalTime });
    } else {
      await setDoc(docRef, { date: today, totalTime });
    }
  } catch (error) {
    console.error("Error updating screen time:", error);
  }
};

// 🔵 Format time into hh:mm:ss
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
};

export default useScreenTimeTracker;
