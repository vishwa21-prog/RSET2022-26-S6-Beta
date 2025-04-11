// Add this at the top of your file
const auth = firebase.auth(); // Firebase authentication reference
const database = firebase.database(); // Firebase Realtime Database reference


// Modify the submit button event listener
document.getElementById("submit-answer").addEventListener("click", function() {
    const userAnswer = document.getElementById("user-answer").value; // Get the user's answer from the input field
    const selectedPlate = document.getElementById("plate-selector").value; // Get the selected plate from the dropdown
    
    // Create results data object to store the user's answer, selected plate, and timestamp
    const resultsData = {
        userAnswer: userAnswer,
        selectedPlate: selectedPlate,
        timestamp: Date.now() // Record the time the answer was submitted
    };
    
    // Save the results to Firebase under the 'ishihara-results' path
    database.ref('ishihara-results').push(resultsData);
    
    // Redirect to the results page, passing the results data as a URL parameter
    const resultData = encodeURIComponent(JSON.stringify(resultsData));
    window.location.href = `ishihara-results.html?data=${resultData}`;
});

// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    const plateSelector = document.getElementById("plate-selector"); // Plate selector dropdown
    const ishiharaImage = document.getElementById("ishihara-image"); // Image element for Ishihara plates
    const submitButton = document.getElementById("submit-answer"); // Submit button for answering
    
    // Add event listener for when the submit button is clicked
    submitButton.addEventListener("click", function() {
        const userAnswer = document.getElementById("user-answer").value; // Get the user's answer from the input field
        const selectedPlate = plateSelector.value; // Get the selected plate
        
        // Display an alert showing the user's answer and selected plate (for demonstration)
        alert(`You answered ${userAnswer} for plate ${selectedPlate}`);
        
        // You could add additional logic here to track if the answer is correct or not
        // For example, compare the answer with the correct value and update the UI or database
    });
});

// In ishihara.js

// Function to save Ishihara test results to Firebase
function saveIshiharaResults(resultsData) {
    const user = auth.currentUser; // Get the current authenticated user
    
    // If no user is signed in, log an error and return
    if (!user) {
      console.error('User must be logged in to save results');
      return;
    }
    
    // Save the results to Firebase under the path 'testResults/{user.uid}/ishihara'
    database.ref(`testResults/${user.uid}/ishihara`).push(resultsData)
      .then(() => {
        // Log success message once the results are saved
        console.log('Ishihara results saved');
      })
      .catch((error) => {
        // Log any errors that occur while saving the results
        console.error('Error saving Ishihara results:', error);
      });
}

// Call this function to save the results (example usage)
saveIshiharaResults({
    userAnswer: userAnswer, // The user's answer
    selectedPlate: selectedPlate, // The plate the user selected
    correctAnswers: resultsData.correctAnswers, // Track the number of correct answers (optional)
    assessment: resultsData.assessment, // Store assessment data if needed (optional)
    recommendations: resultsData.recommendations, // Store recommendations based on the results (optional)
    timestamp: Date.now() // The timestamp of when the results were saved
});

function navigateToResults() {
  const answers = [];
  
  // Collect answers from all test items
  for (let i = 1; i <= 14; i++) {
    const input = document.getElementById(`input-${i}`);
    answers.push(input ? input.value : '');
  }

  // Save test results to Firebase
  saveTestResults({
    testName: 'Ishihara Color Test',
    score: answers.filter(a => a.trim() !== '').length, // Count valid answers
    details: {
      answers: answers
    }
  });

  // Redirect to results page
  const url = new URL('results.html', window.location);
  answers.forEach((answer, index) => {
    url.searchParams.set(`q${index + 1}`, answer);
  });
  window.location.href = url.toString();
}
