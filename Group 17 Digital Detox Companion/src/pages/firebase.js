import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getTTFB } from "web-vitals";
const firebaseConfig = {
  apiKey: "AIzaSyCqW7wIDqd6By6qiQugmupM_WKYHgcs4Wg",
  authDomain: "digital-detox-companion-8bf78.firebaseapp.com",
  projectId: "digital-detox-companion-8bf78",
  storageBucket: "digital-detox-companion-8bf78.appspot.com",
  messagingSenderId: "14799686015",
  appId: "1:14799686015:web:G-H5GEXK9JP1",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)
// ✅ Function to Log Data
const addLogToFirestore = async (userId, appName, duration, category) => {
  try {
    console.log("📌 Attempting to log data...");
    console.log("ℹ️ User ID:", userId);
    console.log("ℹ️ App Name:", appName);
    console.log("ℹ️ Duration:", duration);
    console.log("ℹ️ Category:", category);

    const docRef = await addDoc(collection(db, "screenTimeLogs"), {
      userId,
      appName,
      duration,
      category,
      timestamp: Timestamp.now(),
    });

    console.log("✅ Log added successfully! Doc ID:", docRef.id);
  } catch (error) {
    console.error("❌ Firestore log error:", error);
  }
};

// ✅ Export everything
export { db, addLogToFirestore,auth };
