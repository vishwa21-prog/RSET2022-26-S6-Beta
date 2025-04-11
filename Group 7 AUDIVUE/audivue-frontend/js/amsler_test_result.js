// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFZS00IGb-Huhv6jRmfVfc0MrE86WsQgY",
    authDomain: "audivue-c9f43.firebaseapp.com",
    projectId: "audivue-c9f43",
    storageBucket: "audivue-c9f43.firebasestorage.app",
    messagingSenderId: "342383567867",
    appId: "1:342383567867:web:76e03a34c737b140e3615e"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

// Event listener to handle when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    // Retrieve the test results from URL query string
    const results = JSON.parse(decodeURIComponent(window.location.search.substring(1).split('data=')[1]));

    // Display the test results in the "testResults" div
    const testResultsDiv = document.getElementById('testResults');
    testResultsDiv.innerHTML = `
        <h3>Your Amsler Grid Results</h3>
        <p>You reported: ${results.response}</p>
    `;

    // Display the assessment text in the "assessment" paragraph
    const assessmentDiv = document.getElementById('assessment');
    assessmentDiv.textContent = results.assessment;

    // Display the recommendations in the "recommendations" list
    const recommendationsList = document.getElementById('recommendations');
    recommendationsList.innerHTML = results.recommendations.map(rec => 
        `<li>${rec}</li>`).join('');

    // Store the test results in Firestore
    storeTestResults(results);
});

// Function to store the test results in Firestore
function storeTestResults(results) {
    const userEmail = localStorage.getItem('userEmail'); // Get the user's email from localStorage

    if (userEmail) {
        const userRef = firestore.collection('Users').doc(userEmail);

        // Store the test result under a subcollection 'Amsler Grid Test'
        const testRef = userRef.collection('Amsler Grid Test').doc();

        const testData = {
            response: results.response,
            assessment: results.assessment,
            recommendations: results.recommendations,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        testRef.set(testData)
            .then(() => {
                console.log("Test results successfully stored in Firestore.");
            })
            .catch((error) => {
                console.error("Error storing test results:", error);
            });
    } else {
        console.error("User email not found in localStorage.");
    }
}
