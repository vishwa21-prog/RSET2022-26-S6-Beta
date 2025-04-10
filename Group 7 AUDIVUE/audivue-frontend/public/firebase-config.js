// Import necessary Firebase modules
import { initializeApp } from "firebase/app"; // Import Firebase app initialization function
import {
    getAuth, // Import Firebase Authentication module
    signInWithEmailAndPassword // Import function to sign in users with email and password
} from "firebase/auth";
import {
    getFirestore, // Import Firestore database module
    doc, // Import function to reference a document in Firestore
    setDoc, // Import function to create or update a document in Firestore
    getDoc, // Import function to retrieve a document from Firestore
    serverTimestamp // Import function to generate a timestamp from Firestore server
} from "firebase/firestore";

// Firebase Configuration (Replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBFZS00IGb-Huhv6jRmfVfc0MrE86WsQgY", // API key for Firebase authentication
  authDomain: "audivue-c9f43.firebaseapp.com", // Authentication domain for Firebase
  databaseURL: "https://audivue-c9f43-default-rtdb.asia-southeast1.firebasedatabase.app", // URL for Firebase Realtime Database (not used in this code)
  projectId: "audivue-c9f43", // Project ID for Firebase
  storageBucket: "audivue-c9f43.firebasestorage.app", // Storage bucket for Firebase Storage
  messagingSenderId: "342383567867", // Sender ID for Firebase Cloud Messaging
  appId: "1:342383567867:web:76e03a34c737b140e3615e" // Firebase App ID
};

// Initialize Firebase with the provided configuration
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Authentication
const firestore = getFirestore(app); // Initialize Firestore database

// Sign-in Function
export function signIn(email, password) { 
    signInWithEmailAndPassword(auth, email, password) // Attempt to sign in with email and password
        .then((userCredential) => { // If sign-in is successful
            const user = userCredential.user; // Retrieve the signed-in user
            console.log('User signed in:', user.email); // Log user's email to the console

            // Reference to the user document in Firestore
            const userRef = doc(firestore, 'Users', user.uid); // Get reference to the user’s document in Firestore

            // Check if the user document exists
            getDoc(userRef).then((docSnapshot) => { 
                if (!docSnapshot.exists()) { // If the user document does not exist
                    // If document doesn't exist, create a new user document
                    const userData = {
                        email: user.email, // Store user's email
                        uid: user.uid, // Store user’s unique ID
                        createdAt: serverTimestamp()  // Set creation timestamp using Firestore server timestamp
                    };

                    // Create the user document in Firestore under the 'Users' collection
                    setDoc(userRef, userData)
                        .then(() => {
                            console.log('User document created in Firestore:', user.uid); // Log success message
                        })
                        .catch((error) => {
                            console.error('Error creating Firestore document:', error); // Log error if user document creation fails
                        });
                } else {
                    console.log('User document already exists in Firestore:', user.uid); // Log message if document already exists
                }
            })
            .catch((error) => {
                console.error("Error checking user document:", error); // Log error if document check fails
            });

            // Redirect to index.html after successful login
            window.location.href = "index.html";  // Redirect user to index page
        })
        .catch((error) => { // If sign-in fails
            const errorCode = error.code; // Retrieve error code
            const errorMessage = error.message; // Retrieve error message
            console.error('Sign-in error:', errorCode, errorMessage); // Log sign-in error
            alert('Error: ' + errorMessage);  // Display error message to the user
        });
}
