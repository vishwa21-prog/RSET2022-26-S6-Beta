const PERSPECTIVE_API_KEY = "AIzaSyCIm2KXjdxEycjafxhszuWM6zKQJnqYq3E";
export const analyzeText = async (text) => {
    try {
      console.log("Analyzing text:", text);
  
      const response = await fetch(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment: { text: text },
            languages: ["en"],
            requestedAttributes: { TOXICITY: {} },
          }),
        }
      );
  
      const data = await response.json();
      console.log("API Response:", data);
  
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "Failed to analyze text");
      }
  
      return data.attributeScores.TOXICITY.summaryScore.value;
    } catch (error) {
      console.error("Error analyzing content:", error);
      alert("Error analyzing content. Please try again later.");
      return null;
    }
  };
  