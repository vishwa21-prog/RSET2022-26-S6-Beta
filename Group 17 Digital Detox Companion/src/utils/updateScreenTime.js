import { db } from "../firebase";  
import { doc, setDoc, getDoc } from "firebase/firestore";  

const updateScreenTime = async (userId, time) => {  
  try {  
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD  
    const docRef = doc(db, "users", userId, "screenTime", today);  

    const docSnap = await getDoc(docRef);  
    if (docSnap.exists()) {  
      // ✅ If document exists, update screen time
      await setDoc(docRef, { totalTime: docSnap.data().totalTime + time }, { merge: true });  
    } else {  
      // ✅ If document does NOT exist, create it
      await setDoc(docRef, { totalTime: time });  
    }  
    console.log("✅ Screen time updated successfully!");  
  } catch (error) {  
    console.error("❌ Error updating screen time:", error);  
  }  
};  

export default updateScreenTime;
