// Add this at the top of your file
const auth = firebase.auth(); // Firebase authentication reference
const database = firebase.database(); // Firebase Realtime Database reference


// Modify the submit button event listener
submitButton.addEventListener("click", function () {
    // Create an object to hold the tinnitus test data
    let tinnitusData = {
        frequency: frequencySlider.value, // Get the frequency value from the slider
        volume: volumeSlider.value, // Get the volume value from the slider
        timestamp: Date.now() // Capture the time of the test submission
    };
    
    // Save the tinnitus data to Firebase under 'tinnitus-results'
    database.ref('tinnitus-results').push(tinnitusData);
    
    // Convert the tinnitus data into a URL-encoded format to pass to the results page
    let resultData = encodeURIComponent(JSON.stringify(tinnitusData));
    window.location.href = `result.html?data=${resultData}`; // Redirect to the results page with the test data
});

// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Get references to HTML elements
    const playButton = document.getElementById("playTone"); // Button to start the tone
    const stopButton = document.getElementById("stopTone"); // Button to stop the tone
    const submitButton = document.getElementById("submitTest"); // Button to submit the test
    
    const frequencySlider = document.getElementById("frequency"); // Frequency slider
    const volumeSlider = document.getElementById("volume"); // Volume slider

    const frequencyDisplay = document.getElementById("frequencyValue"); // Display the selected frequency
    const volumeDisplay = document.getElementById("volumeValue"); // Display the selected volume

    const resultText = document.getElementById("resultText"); // Text area to display result info

    // Set up audio context for playing the tone
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator, gainNode;

    // Function to start the tone with the specified frequency and volume
    function startTone(frequency, volume) {
        stopTone(); // Stop any previously playing tone

        // Create oscillator and gain node for audio context
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();

        oscillator.type = "sine"; // Tone type: sine wave
        oscillator.frequency.value = frequency; // Set frequency of the tone

        // Convert volume from dB to linear gain value
        let gainValue = Math.pow(10, volume / 20); // Volume in dB, converted to a linear scale
        gainNode.gain.value = gainValue;

        oscillator.connect(gainNode); // Connect oscillator to gain node
        gainNode.connect(audioContext.destination); // Connect gain node to audio output

        oscillator.start(); // Start playing the tone

        // Display the current frequency and volume in the result text
        resultText.textContent = `Playing tone at ${frequency} Hz and ${volume} dB`;
    }

    // Function to stop the tone
    function stopTone() {
        if (oscillator) {
            oscillator.stop(); // Stop the oscillator (tone)
            oscillator.disconnect(); // Disconnect the oscillator from the audio context
        }
    }

    // Update frequency display when the frequency slider is adjusted
    frequencySlider.addEventListener("input", function () {
        frequencyDisplay.textContent = frequencySlider.value; // Display selected frequency
        if (oscillator) oscillator.frequency.value = frequencySlider.value; // Adjust frequency of the tone
    });

    // Update volume display when the volume slider is adjusted
    volumeSlider.addEventListener("input", function () {
        volumeDisplay.textContent = volumeSlider.value; // Display selected volume
        if (gainNode) gainNode.gain.value = Math.pow(10, volumeSlider.value / 20); // Adjust volume
    });

    // Play button click listener to start the tone
    playButton.addEventListener("click", function () {
        startTone(frequencySlider.value, volumeSlider.value); // Start the tone with current slider values
        stopButton.disabled = false; // Enable stop button
        submitButton.disabled = false; // Enable submit button
    });

    // Stop button click listener to stop the tone
    stopButton.addEventListener("click", function () {
        stopTone(); // Stop the tone
        stopButton.disabled = true; // Disable stop button
    });

    // Submit button click listener to save the tinnitus test data
    submitButton.addEventListener("click", function () {
        let tinnitusData = {
            frequency: frequencySlider.value, // Get the frequency value from the slider
            volume: volumeSlider.value // Get the volume value from the slider
        };

        // Convert the tinnitus data into a URL-encoded format
        let resultData = encodeURIComponent(JSON.stringify(tinnitusData));
        window.location.href = `result.html?data=${resultData}`; // Redirect to the results page with the test data
    });
});

// Function to save tinnitus results to Firebase
function saveTinnitusResults(resultsData) {
    const user = auth.currentUser; // Get the current authenticated user
    
    // If no user is signed in, log an error and return
    if (!user) {
      console.error('User must be logged in to save results');
      return;
    }
    
    // Save the results data to Firebase under the user's test results path
    database.ref(`testResults/${user.uid}/tinnitus`).push(resultsData)
      .then(() => {
        console.log('Tinnitus results saved');
      })
      .catch((error) => {
        console.error('Error saving Tinnitus results:', error); // Log any errors that occur while saving the results
      });
}

// Example usage of saveTinnitusResults function to store data
saveTinnitusResults({
    frequency: frequencySlider.value, // Save the frequency of the test
    volume: volumeSlider.value, // Save the volume of the test
    timestamp: Date.now() // Save the time the test was taken
});

submitButton.addEventListener("click", function () {
    let tinnitusData = {
      frequency: frequencySlider.value,
      volume: volumeSlider.value,
      timestamp: Date.now()
    };
  
    // Save test results to Firebase
    saveTestResults({
      testName: 'Tinnitus Test',
      score: tinnitusData.volume,
      details: {
        frequency: tinnitusData.frequency,
        volume: tinnitusData.volume
      }
    });
  
    // Redirect to results page
    let resultData = encodeURIComponent(JSON.stringify(tinnitusData));
    window.location.href = `result.html?data=${resultData}`;
  });
