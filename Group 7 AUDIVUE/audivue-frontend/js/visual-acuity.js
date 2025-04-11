const e = React.createElement;

function VisualAcuityTest() {
  // All possible characters
  const allLetters = ["E", "F", "P", "T", "O", "Z", "L", "D", "A", "B", "C", "H", "K", "N", "R", "S"];
  
  // Fixed size progression (large to small)
  const sizeProgression = [80, 60, 50, 40, 30, 25, 20, 15, 10];
  
  // Diopter mapping
  const sizeToDiopter = {
    80: -5.00, 60: -4.00, 50: -3.50, 40: -3.00,
    30: -2.00, 25: -1.50, 20: -1.00, 15: -0.50, 10: -0.00
  };

  // Improved randomization that shuffles letters for each size
  const generateNewTest = () => {
    // Create a copy of allLetters that we can modify
    const availableLetters = [...allLetters];
    
    // Shuffle the available letters
    for (let i = availableLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableLetters[i], availableLetters[j]] = [availableLetters[j], availableLetters[i]];
    }
    
    return sizeProgression.map((size, index) => {
      // If we've used all letters, reset the available letters
      if (index >= availableLetters.length) {
        const randomIndex = Math.floor(Math.random() * allLetters.length);
        return {
          character: allLetters[randomIndex],
          size: size,
          diopter: sizeToDiopter[size]
        };
      }
      
      return {
        character: availableLetters[index],
        size: size,
        diopter: sizeToDiopter[size]
      };
    });
  };

  // Initialize state
  const [testChars, setTestChars] = React.useState(() => generateNewTest());
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [userInput, setUserInput] = React.useState("");
  const [currentEye, setCurrentEye] = React.useState("left");
  const [results, setResults] = React.useState({ left: null, right: null });
  const [testFinished, setTestFinished] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Calculate results
  const calculateResult = (failedIndex) => {
    if (failedIndex === 0) return { diopter: -5.00, snellen: "20/200", lastCorrectSize: 80 };
    if (failedIndex === 1) return { diopter: -4.00, snellen: "20/160", lastCorrectSize: 60 };
    
    const correctChar = testChars[failedIndex - 1];
    const snellenValue = Math.round((correctChar.size / 10) * 20);
    return {
      diopter: correctChar.diopter,
      snellen: `20/${Math.min(snellenValue, 200)}`,
      lastCorrectSize: correctChar.size
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentChar = testChars[currentIndex].character;

    if (userInput.toUpperCase() === currentChar) {
      if (currentIndex < testChars.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserInput("");
      } else {
        saveResultsAndContinue({
          diopter: -0.00,
          snellen: "20/20",
          lastCorrectSize: 10
        });
      }
    } else {
      saveResultsAndContinue(calculateResult(currentIndex));
    }
  };

  const saveResultsAndContinue = (result) => {
    const newResults = { ...results, [currentEye]: result };
    setResults(newResults);
    
    if (currentEye === "left") {
      setCurrentEye("right");
      setTestChars(generateNewTest());
      setCurrentIndex(0);
      setUserInput("");
    } else {
      setTestFinished(true);
    }
  };

  const restartTest = (eye = "both") => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newTest = generateNewTest();
      setTestChars(newTest);
      
      if (eye === "both") {
        setCurrentEye("left");
        setResults({ left: null, right: null });
      } else {
        setCurrentEye(eye);
        setResults({ ...results, [eye]: null });
      }
      setCurrentIndex(0);
      setUserInput("");
      setTestFinished(false);
      setIsLoading(false);
    }, 500);
  };

  const getStatusMessage = (result) => {
    if (!result) return "Not tested";
    if (result.diopter <= -3.00) return "Severe myopia";
    if (result.diopter <= -1.00) return "Moderate myopia";
    if (result.diopter < -0.25) return "Mild myopia";
    return "Normal vision";
  };

  if (isLoading) {
    return e("div", { className: "test-container loading" },
      e("h1", null, "Preparing Test..."),
      e("div", { className: "loading-spinner" })
    );
  }

  if (testFinished) {
    return e("div", { className: "test-container" },
      e("h1", null, "Eye Test Results"),
      e("div", { className: "results-section" },
        e("h2", null, "Left Eye"),
        e("p", null, "Visual Acuity: ", results.left?.snellen || "N/A"),
        e("p", null, "Refractive Error: ", results.left ? results.left.diopter.toFixed(2) + " D" : "N/A"),
        e("p", null, "Status: ", getStatusMessage(results.left))
      ),
      e("div", { className: "results-section" },
        e("h2", null, "Right Eye"),
        e("p", null, "Visual Acuity: ", results.right?.snellen || "N/A"),
        e("p", null, "Refractive Error: ", results.right ? results.right.diopter.toFixed(2) + " D" : "N/A"),
        e("p", null, "Status: ", getStatusMessage(results.right))
      ),
      e("div", { className: "button-group" },
        e("button", { 
          onClick: () => restartTest("both"),
          className: "retake-btn"
        }, "Retake Both Tests"),
        e("button", { 
          onClick: () => restartTest("left"),
          className: "retake-btn"
        }, "Retake Left Eye"),
        e("button", { 
          onClick: () => restartTest("right"),
          className: "retake-btn"
        }, "Retake Right Eye")
      )
    );
  }

  return e("div", { className: "test-container" },
    e("h1", null, "Visual Acuity Eye Test"),
    e("p", { className: "instructions" },
      currentEye === "left" ? "Cover your RIGHT eye" : "Cover your LEFT eye"),
    e("div", { 
      className: "character-display",
      style: { fontSize: `${testChars[currentIndex].size}px` }
    }, testChars[currentIndex].character),
    e("form", { onSubmit: handleSubmit, className: "input-form" },
      e("input", {
        type: "text",
        value: userInput,
        onChange: (e) => setUserInput(e.target.value),
        maxLength: 1,
        autoFocus: true
      }),
      e("button", { type: "submit" }, "Submit")
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(VisualAcuityTest));