// Sign up new user
function signUp(email, password) {
  // Create a new user with the provided email and password
  return auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in successfully
      const user = userCredential.user; // Get the signed-in user object
      console.log('User signed up:', user);

      // Save the new user to the Firebase Realtime Database
      saveUserToDatabase(user);

      // Redirect to the index page after successful sign-up
      window.location.href = 'index.html';
    })
    .catch((error) => {
      // Catch any error during the sign-up process
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Sign-up error:', errorCode, errorMessage);
      alert('Sign-up failed: ' + errorMessage); // Show an alert with the error message
    });
}

// Sign in existing user
function signIn(email, password) {
  // Sign in with the provided email and password
  return auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in successfully
      const user = userCredential.user; // Get the signed-in user object
      console.log('User signed in:', user);

      // Redirect to the index page after successful sign-in
      window.location.href = 'index.html';
    })
    .catch((error) => {
      // Catch any error during the sign-in process
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Sign-in error:', errorCode, errorMessage);
      alert('Sign-in failed: ' + errorMessage); // Show an alert with the error message
    });
}

// Save user to Firebase Realtime Database
function saveUserToDatabase(user) {
  const usersRef = database.ref('users/' + user.uid); // Reference to the 'users' path with the user's unique ID

  // Save the user's email and created timestamp to the database
  usersRef.set({
    email: user.email, 
    createdAt: Date.now()
  })
  .catch((error) => {
    // Catch any error during saving the user data
    console.error('Error saving user to database:', error);
  });
}

// Check authentication state (if the user is signed in or not)
function checkAuthState() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      console.log('User is signed in:', user);
      showLoggedInUI(); // Call function to show UI for logged-in users
    } else {
      // User is signed out
      console.log('User is signed out');
      showLoggedOutUI(); // Call function to show UI for logged-out users
    }
  });
}

// Sign out user
function signOut() {
  // Sign out the current user
  auth.signOut()
    .then(() => {
      console.log('User signed out');
      window.location.href = 'login.html'; // Redirect to the login page after signing out
    })
    .catch((error) => {
      // Catch any error during the sign-out process
      console.error('Error signing out:', error);
    });
}

// Save test results to Firebase Realtime Database
function saveTestResults(testData) {
  const user = auth.currentUser; // Get the current signed-in user
  if (!user) {
    // If no user is signed in, log an error and return
    console.error('No user signed in to save test results');
    return;
  }

  const testResultsRef = database.ref('testResults/' + user.uid); // Reference to the test results path with the user's UID
  
  // Generate a unique ID for the new test result
  const newTestResultKey = testResultsRef.push().key;

  const testResultData = {
    testId: newTestResultKey, // Unique test result ID
    userId: user.uid, // User ID
    testName: testData.testName, // Test name (e.g., 'Sample Test')
    score: testData.score, // Test score (e.g., 85)
    date: Date.now(), // Date when the test was taken
    details: testData.details || {} // Optional details of the test (e.g., questions answered, time taken)
  };

  // Save the test result data to the Firebase Realtime Database under the user's UID
  return testResultsRef.child(newTestResultKey).set(testResultData)
    .then(() => {
      // Log success message after saving the test results
      console.log('Test results saved successfully');
    })
    .catch((error) => {
      // Catch any error during the save process
      console.error('Error saving test results:', error);
    });
}

// Example usage of saveTestResults
function submitTest() {
  // Example test data (this would come from your application)
  const testData = {
    testName: 'Sample Test', // Name of the test
    score: 85, // Test score
    details: {
      questionsAnswered: 10, // Number of questions answered
      timeTaken: 300 // Time taken for the test (in seconds)
    }
  };

  // Call saveTestResults to save the test data to the database
  saveTestResults(testData)
    .then(() => {
      alert('Test results saved!'); // Show a success message
      window.location.href = 'results.html'; // Redirect to the results page
    })
    .catch((error) => {
      // Catch any error during saving and show an alert with the error message
      alert('Failed to save test results: ' + error.message);
    });
}

// Initialize authentication state checking when the page loads
checkAuthState();

// Save test results to database (repeated function definition, could be removed)
function saveTestResults(testData) {
  const user = auth.currentUser; // Get the current signed-in user
  if (!user) {
    console.error('No user signed in to save test results'); // Log an error if no user is signed in
    return;
  }

  const testResultsRef = database.ref('testResults/' + user.uid); // Reference to the 'testResults' path with user UID
  
  // Generate a unique key for this test result
  const newTestResultKey = testResultsRef.push().key;

  const testResultData = {
    testId: newTestResultKey, // Unique test result ID
    userId: user.uid, // User ID
    testName: testData.testName, // Test name (e.g., 'Sample Test')
    score: testData.score, // Test score
    date: Date.now(), // Date of the test
    details: testData.details || {} // Additional details for the test (optional)
  };

  // Save the test result to the Firebase Realtime Database
  return testResultsRef.child(newTestResultKey).set(testResultData)
    .then(() => {
      console.log('Test results saved successfully'); // Success log
    })
    .catch((error) => {
      console.error('Error saving test results:', error); // Error log if the save fails
    });
}
