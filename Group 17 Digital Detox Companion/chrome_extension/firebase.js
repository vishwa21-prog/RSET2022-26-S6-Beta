import { initializeApp } from "firebase/app";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqW7wIDqd6By6qiQugmupM_WKYHgcs4Wg",
  authDomain: "digital-detox-companion-8bf78.firebaseapp.com",
  projectId: "digital-detox-companion-8bf78",
  storageBucket: "digital-detox-companion-8bf78.appspot.com",
  messagingSenderId: "14799686015",
  appId: "1:14799686015:web:G-H5GEXK9JP1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Authentication helper
const ensureAuth = async () => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
      console.log("Authenticated with ID:", auth.currentUser.uid);
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }
  return auth.currentUser.uid;
};

// Screen time logging function
const logScreenTime = async (url, duration, category) => {
  try {
    const userId = await ensureAuth();
    await addDoc(collection(db, "screenTimeLogs"), {
      userId,
      url,
      duration,
      category,
      timestamp: serverTimestamp()
    });
    console.log("Successfully logged screen time");
  } catch (error) {
    console.error("Error logging screen time:", error);
    throw error;
  }
};

export { db, auth, logScreenTime };