// Add Firebase authentication and database references at the top of your file
const auth = firebase.auth(); // Reference to Firebase authentication
const database = firebase.database(); // Reference to Firebase Realtime Database

// Modify the event listener for the "yes-button"
document.getElementById("yes-button").addEventListener("click", function() {
    // ... existing code ...
    
    // Save the response and results to Firebase database under 'amsler-grid-results'
    database.ref('amsler-grid-results').push({
        response: "Yes, I see distortion", // Response data when the user sees distortion
        assessment: resultsData.assessment, // Assessment data from the test
        recommendations: resultsData.recommendations, // Recommendations based on the test
        timestamp: Date.now() // Current timestamp when the result was saved
    });
    
    // ... existing code ...
});

// Modify the event listener for the "no-button"
document.getElementById("no-button").addEventListener("click", function() {
    // ... existing code ...
    
    // Save the response and results to Firebase database under 'amsler-grid-results'
    database.ref('amsler-grid-results').push({
        response: "No, I don't see distortion", // Response data when the user doesn't see distortion
        assessment: resultsData.assessment, // Assessment data from the test
        recommendations: resultsData.recommendations, // Recommendations based on the test
        timestamp: Date.now() // Current timestamp when the result was saved
    });
    
    // ... existing code ...
});

// Event listener that waits for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the reference to the grid selector and Amsler grid image elements
    const gridSelector = document.getElementById("grid-selector");
    const amslerGridImage = document.getElementById("amsler-grid");

    // Add an event listener for when the grid selection changes
    gridSelector.addEventListener("change", function() {
        // Update the Amsler grid image source based on the selected option
        amslerGridImage.src = this.value;
        
        // Add an event listener again to ensure image updates correctly
        document.getElementById("grid-selector").addEventListener("change", function() {
            // Update the Amsler grid image source based on the selected option
            document.getElementById("amsler-grid").src = "images/" + this.value;
        });
    });
});

// In amsler-grid.js - Function to save test results to Firebase
function saveTestResults(testData) {
    const user = auth.currentUser; // Get the currently authenticated user
    if (!user) {
      // If no user is logged in, display an error in the console
      console.error('User must be logged in to save results');
      return;
    }
    
    // Save the test data to Firebase under the user's specific UID and 'amslerGrid' path
    database.ref(`testResults/${user.uid}/amslerGrid`).push(testData)
      .then(() => {
        // If successful, log success in the console
        console.log('Amsler Grid results saved');
      })
      .catch((error) => {
        // If there's an error, log the error in the console
        console.error('Error saving Amsler Grid results:', error);
      });
}

// Example call to save the test results
saveTestResults({
    response: resultsData.response, // User's response to the test
    assessment: resultsData.assessment, // Assessment data from the test
    recommendations: resultsData.recommendations, // Recommendations from the test
    timestamp: Date.now() // Current timestamp when the result is saved
});

document.getElementById("yes-button").addEventListener("click", function() {
    const resultsData = {
      response: "Yes, I see distortion",
      assessment: "You reported seeing distortion or missing lines on the Amsler Grid.",
      recommendations: [
        "This may indicate potential vision issues such as macular degeneration, diabetic retinopathy, or other macular disorders.",
        "We recommend consulting with an eye care professional for further evaluation."
      ]
    };
  
    // Save test results to Firebase
    saveTestResults({
      testName: 'Amsler Grid Test',
      score: 1, // Indicates a positive result
      details: resultsData
    });
  
    // Redirect to results page
    const resultData = encodeURIComponent(JSON.stringify(resultsData));
    window.location.href = `amsler-grid-results.html?data=${resultData}`;
  });
  
  document.getElementById("no-button").addEventListener("click", function() {
    const resultsData = {
      response: "No, I don't see distortion",
      assessment: "Your central vision appears normal based on this preliminary test.",
      recommendations: [
        "This suggests your central vision appears normal based on this preliminary test.",
        "Remember that this is not a substitute for a comprehensive eye examination."
      ]
    };
  
    // Save test results to Firebase
    saveTestResults({
      testName: 'Amsler Grid Test',
      score: 0, // Indicates a negative result
      details: resultsData
    });
  
    // Redirect to results page
    const resultData = encodeURIComponent(JSON.stringify(resultsData));
    window.location.href = `amsler-grid-results.html?data=${resultData}`;
  });
