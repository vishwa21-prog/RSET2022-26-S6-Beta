// Gemini API Integration for Resume Analysis
class ResumeAnalyzer {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.loading = false;
      this.analysisResult = null;
      this.initializeUI();
    }
  
    initializeUI() {
      // Create or connect to existing DOM elements
      const container = document.getElementById('resumeAnalysisContainer') || document.body;
      
      // Create UI elements if they don't exist
      if (!document.getElementById('resumeUploadSection')) {
        container.innerHTML = `
          <div id="resumeAnalysisTool" class="resume-analysis-tool">
            <div id="resumeUploadSection" class="upload-section">
              <div class="upload-box" id="uploadBox">
                <i class="fas fa-cloud-upload-alt"></i>
                <h3>Upload Resume</h3>
                <p>Drag & drop a PDF, DOCX, or TXT file here or click to browse</p>
                <input type="file" id="resumeFileInput" accept=".pdf,.doc,.docx,.txt" style="display: none;">
                <button id="analyzeSampleBtn" class="sample-btn">Analyze Sample Resume</button>
              </div>
            </div>
            <div id="analysisResultsSection" class="analysis-results" style="display: none;">
              <div class="results-header">
                <h3>Resume Analysis Results</h3>
                <button id="newAnalysisBtn" class="btn-secondary">New Analysis</button>
              </div>
              <div id="analysisResultsContent" class="results-content"></div>
            </div>
            <div id="loadingIndicator" class="loading-indicator" style="display: none;">
              <div class="spinner"></div>
              <p>Analyzing your resume...</p>
            </div>
          </div>
        `;
  
        // Add event listeners
        document.getElementById('uploadBox').addEventListener('click', () => {
          document.getElementById('resumeFileInput').click();
        });
  
        document.getElementById('resumeFileInput').addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            this.analyzeResume(e.target.files[0]);
          }
        });
  
        document.getElementById('analyzeSampleBtn').addEventListener('click', () => {
          this.analyzeSampleResume();
        });
  
        document.getElementById('newAnalysisBtn').addEventListener('click', () => {
          this.resetAnalysis();
        });
  
        // Add drag and drop support
        const uploadBox = document.getElementById('uploadBox');
        uploadBox.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadBox.classList.add('dragover');
        });
  
        uploadBox.addEventListener('dragleave', () => {
          uploadBox.classList.remove('dragover');
        });
  
        uploadBox.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadBox.classList.remove('dragover');
          if (e.dataTransfer.files.length > 0) {
            this.analyzeResume(e.dataTransfer.files[0]);
          }
        });
      }
    }
  
    async analyzeResume(file) {
      if (this.loading) return;
      
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'text/plain'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, DOCX, or TXT file.');
        return;
      }
  
      this.showLoading();
  
      try {
        // Extract text from resume
        const text = await this.extractTextFromResume(file);
        
        // Analyze with Gemini API
        const analysis = await this.analyzeWithGemini(text);
        
        // Display results
        this.displayAnalysisResults(analysis);
      } catch (error) {
        console.error('Error analyzing resume:', error);
        alert('Error analyzing resume. Please try again.');
      } finally {
        this.hideLoading();
      }
    }
  
    async analyzeSampleResume() {
      if (this.loading) return;
      
      this.showLoading();
  
      try {
        // Sample resume text (in a real app, you might load this from a file)
        const sampleText = `
          John Doe
          Software Engineer
          johndoe@example.com | (123) 456-7890 | linkedin.com/in/johndoe
          
          SUMMARY
          Experienced software engineer with 5+ years in full-stack development. 
          Specialized in JavaScript, React, Node.js, and cloud technologies.
          
          EXPERIENCE
          Senior Developer - ABC Tech (2020-Present)
          - Led team of 5 developers to build enterprise SaaS platform
          - Reduced API response times by 40% through optimization
          - Implemented CI/CD pipeline reducing deployment time by 60%
          
          EDUCATION
          B.S. Computer Science - XYZ University (2018)
          
          SKILLS
          JavaScript, React, Node.js, AWS, Docker, SQL
        `;
        
        // Analyze with Gemini API
        const analysis = await this.analyzeWithGemini(sampleText);
        
        // Display results
        this.displayAnalysisResults(analysis);
      } catch (error) {
        console.error('Error analyzing sample resume:', error);
        alert('Error analyzing sample resume. Please try again.');
      } finally {
        this.hideLoading();
      }
    }
  
    async extractTextFromResume(file) {
      // For PDF files
      if (file.type === 'application/pdf') {
        return this.extractTextFromPDF(file);
      }
      // For DOCX files
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return this.extractTextFromDOCX(file);
      }
      // For plain text
      else if (file.type === 'text/plain') {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsText(file);
        });
      }
      // For older DOC format (would need more sophisticated handling)
      else {
        throw new Error('Unsupported file format for text extraction');
      }
    }
  
    async extractTextFromPDF(file) {
      // In a real implementation, you would use a PDF parsing library like pdf.js
      // This is a simplified version that just extracts raw text
      const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ') + '\n';
      }
      
      return fullText;
    }
  
    async extractTextFromDOCX(file) {
      // In a real implementation, you would use a DOCX parsing library
      // This is a placeholder that just extracts raw text
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Simple text extraction (would need proper DOCX parsing in production)
          resolve('DOCX content would be extracted here');
        };
        reader.readAsArrayBuffer(file);
      });
    }
  
    async analyzeWithGemini(resumeText) {
      // Prepare the prompt for Gemini
      const prompt = `
        Analyze the following resume and provide a detailed assessment with the following sections:
        
        1. **Overall Summary**: Brief overview of the candidate's profile
        2. **Strengths**: Key strengths and standout features
        3. **Areas for Improvement**: Suggestions for improving the resume
        4. **Skill Analysis**: Breakdown of technical and soft skills
        5. **Experience Assessment**: Evaluation of work experience
        6. **Education**: Summary of educational background
        7. **ATS Optimization**: How well the resume would perform in Applicant Tracking Systems
        8. **Customized Suggestions**: Specific improvements tailored to this resume
        
        Format the response in HTML with appropriate headings and bullet points.
        
        Resume:
        ${resumeText}
      `;
  
      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
  
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
  
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }
  
    displayAnalysisResults(analysis) {
      const uploadSection = document.getElementById('resumeUploadSection');
      const resultsSection = document.getElementById('analysisResultsSection');
      const resultsContent = document.getElementById('analysisResultsContent');
      
      // Store the analysis result
      this.analysisResult = analysis;
      
      // Display the results
      resultsContent.innerHTML = analysis;
      
      // Switch to results view
      uploadSection.style.display = 'none';
      resultsSection.style.display = 'block';
    }
  
    resetAnalysis() {
      const uploadSection = document.getElementById('resumeUploadSection');
      const resultsSection = document.getElementById('analysisResultsSection');
      const fileInput = document.getElementById('resumeFileInput');
      
      // Clear the file input
      fileInput.value = '';
      
      // Switch back to upload view
      resultsSection.style.display = 'none';
      uploadSection.style.display = 'block';
      
      // Clear the analysis result
      this.analysisResult = null;
    }
  
    showLoading() {
      this.loading = true;
      const loadingIndicator = document.getElementById('loadingIndicator');
      const uploadSection = document.getElementById('resumeUploadSection');
      
      uploadSection.style.display = 'none';
      loadingIndicator.style.display = 'flex';
    }
  
    hideLoading() {
      this.loading = false;
      const loadingIndicator = document.getElementById('loadingIndicator');
      loadingIndicator.style.display = 'none';
    }
  }
  
  // Initialize the analyzer when the page loads
  document.addEventListener('DOMContentLoaded', () => {
    // Get API key from environment variable or prompt
    const apiKey = AIzaSyCMHIVhyeugDR2h9eS4GG6B638QUyrgaOo
    
    if (apiKey) {
      window.resumeAnalyzer = new ResumeAnalyzer(apiKey);
    } else {
      alert('Gemini API key is required for resume analysis');
    }
  });