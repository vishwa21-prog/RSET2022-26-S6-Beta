import { db } from "../firebase";
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Function to log screen time usage (adds up total screen time per app)
export const logScreenTime = async (userId, appName, duration) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date
    const screenTimeRef = doc(db, "screenTimeLogs", `${userId}_${appName}_${today}`);

    const docSnap = await getDoc(screenTimeRef);

    if (docSnap.exists()) {
      // If an entry exists for today, update the total screen time
      await updateDoc(screenTimeRef, {
        duration: docSnap.data().duration + duration,
        lastUpdated: serverTimestamp(),
      });
    } else {
      // If no entry exists, create a new one
      await setDoc(screenTimeRef, {
        userId,
        appName,
        duration,
        date: today,
        lastUpdated: serverTimestamp(),
      });
    }

    console.log(`Screen time updated: ${duration} seconds`);
  } catch (error) {
    console.error("Error logging screen time:", error);
  }
};
