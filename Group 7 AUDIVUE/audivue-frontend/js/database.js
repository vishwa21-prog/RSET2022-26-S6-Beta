// Save test results to Firebase Realtime Database
function saveTestResults(testData) {
  const user = auth.currentUser; // Get the current authenticated user

  if (!user) { // Check if a user is logged in
    console.error('User must be logged in to save results'); // Log an error message if no user is logged in
    return; // Exit the function to prevent further execution
  }

  const testResultsRef = database.ref(`testResults/${user.uid}`); 
  // Create a reference in Firebase to store the test results under the user's unique ID

  // Generate a unique ID for the new test result
  const newTestResultKey = testResultsRef.push().key;

  const testResultData = {
    testId: newTestResultKey, // Assign the generated unique ID to the test result
    userId: user.uid, // Store the user's ID
    testName: testData.testName, // Store the name of the test
    score: testData.score, // Store the test score or result
    date: Date.now(), // Store the current timestamp as the test date
    details: testData.details || {} // Store additional test details, defaulting to an empty object if not provided
  };

  // Save the test result to Firebase
  return testResultsRef.child(newTestResultKey).set(testResultData) 
    .then(() => { 
      console.log('Test results saved successfully'); // Log a success message if the save is successful
    })
    .catch((error) => { 
      console.error('Error saving test results:', error); // Log an error message if saving fails
    });
}
