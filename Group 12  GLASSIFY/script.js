// DOM Elements
const video = document.getElementById('video');
const uploadedImage = document.getElementById('uploaded-image');
const faceOverlayCanvas = document.getElementById('face-overlay');
const glassesOverlayCanvas = document.getElementById('glasses-overlay');
const faceOverlayCtx = faceOverlayCanvas.getContext('2d');
const glassesOverlayCtx = glassesOverlayCanvas.getContext('2d');
const inputMode = document.getElementById('input-mode');
const uploadBtn = document.getElementById('upload-btn');
const uploadSection = document.getElementById('upload-section');
const uploadGlassesBtn = document.getElementById('upload-glasses-btn');
const frameWidthInput = document.getElementById('frame-width');
const frameHeightInput = document.getElementById('frame-height');

// Configuration
const DEBUG_MODE = false; // Set to true to visualize facial landmarks
const DETECTION_THROTTLE_MS = 100; // Limit detection to 10fps
const NO_FACE_TIMEOUT = 3000; // 3 seconds before showing "no face" warning

// State Variables
let glassesImage = null;
let uploadedFaceImage = null;
let isWebcamActive = false;
let detectionInterval = null;
let lastDetectionTime = 0;
let noFaceTimer = null;
let lastFaceDetectionTime = 0;

// Load Face API Models
async function loadModels() {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('models')
    ]);
    console.log('Models loaded successfully');
    if (inputMode.value === 'webcam') startWebcam();
  } catch (err) {
    console.error('Error loading models:', err);
    alert('Failed to load face detection models. Please try refreshing the page.');
  }
}

// Image Processing
function processGlassesImage(image, callback) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  tempCtx.drawImage(image, 0, 0);

  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  const whiteThreshold = 220;
  let minX = tempCanvas.width, maxX = 0, minY = tempCanvas.height, maxY = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], alpha = data[i+3];
    const x = (i / 4) % tempCanvas.width;
    const y = Math.floor((i / 4) / tempCanvas.width);

    if (!(r > whiteThreshold && g > whiteThreshold && b > whiteThreshold) || alpha < 255) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    if (r > whiteThreshold && g > whiteThreshold && b > whiteThreshold) {
      data[i+3] = 0;
    }
  }

  if (minX >= maxX || minY >= maxY) {
    console.warn('No valid pixels detected in glasses image. Using original.');
    callback(image);
    return;
  }

  tempCtx.putImageData(imageData, 0, 0);

  const trimmedWidth = maxX - minX;
  const trimmedHeight = maxY - minY;
  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  const trimmedCtx = trimmedCanvas.getContext('2d', { willReadFrequently: true });

  trimmedCtx.drawImage(tempCanvas, minX, minY, trimmedWidth, trimmedHeight, 
                      0, 0, trimmedWidth, trimmedHeight);

  const processedImage = new Image();
  processedImage.onload = () => callback(processedImage);
  processedImage.src = trimmedCanvas.toDataURL('image/png');
}

// Webcam Management
async function startWebcam() {
  stopWebcam();
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 }, 
        height: { ideal: 480 },
        facingMode: 'user' 
      } 
    });
    
    video.srcObject = stream;
    video.style.display = "block";
    
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        faceOverlayCanvas.width = video.videoWidth;
        faceOverlayCanvas.height = video.videoHeight;
        glassesOverlayCanvas.width = video.videoWidth;
        glassesOverlayCanvas.height = video.videoHeight;
        resolve();
      };
    });
    
    isWebcamActive = true;
    lastFaceDetectionTime = Date.now(); // Initialize face detection time
    detectWebcamFaces();
  } catch (err) {
    console.error('Webcam error:', err);
    alert('Could not access webcam. Please check permissions or try upload mode.');
    inputMode.value = 'upload';
    toggleInputMode();
  }
}

function stopWebcam() {
  if (detectionInterval) {
    cancelAnimationFrame(detectionInterval);
    detectionInterval = null;
  }
  
  if (noFaceTimer) {
    clearTimeout(noFaceTimer);
    noFaceTimer = null;
  }
  
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  
  clearCanvases();
  isWebcamActive = false;
}

function clearCanvases() {
  faceOverlayCtx.clearRect(0, 0, faceOverlayCanvas.width, faceOverlayCanvas.height);
  glassesOverlayCtx.clearRect(0, 0, glassesOverlayCanvas.width, glassesOverlayCanvas.height);
}

// Face Detection
async function detectWebcamFaces() {
  if (!isWebcamActive || Date.now() - lastDetectionTime < DETECTION_THROTTLE_MS) {
    detectionInterval = requestAnimationFrame(detectWebcamFaces);
    return;
  }

  try {
    const detections = await faceapi.detectSingleFace(video, 
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
      .withFaceLandmarks();
    
    if (detections) {
      // Face detected
      lastFaceDetectionTime = Date.now();
      if (noFaceTimer) {
        clearTimeout(noFaceTimer);
        noFaceTimer = null;
      }
      
      if (glassesImage) {
        drawGlasses(detections, video);
      }
    } else {
      // No face detected
      glassesOverlayCtx.clearRect(0, 0, glassesOverlayCanvas.width, glassesOverlayCanvas.height);
      
      
      if (!noFaceTimer && Date.now() - lastFaceDetectionTime > NO_FACE_TIMEOUT) {
        noFaceTimer = setTimeout(() => {
          alert('No face detected. Please position your face in the camera view.');
          noFaceTimer = null;
        }, NO_FACE_TIMEOUT);
      }
    }
    
    lastDetectionTime = Date.now();
  } catch (err) {
    console.error('Detection error:', err);
  } finally {
    detectionInterval = requestAnimationFrame(detectWebcamFaces);
  }
}

async function detectFaceAndDrawGlasses(image) {
  try {
    const detections = await faceapi.detectSingleFace(image, 
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
      .withFaceLandmarks();
    
    if (!detections) {
      console.warn('No face detected');
      glassesOverlayCtx.clearRect(0, 0, glassesOverlayCanvas.width, glassesOverlayCanvas.height);
      alert('No face detected in the uploaded image. Please try another image.');
      return;
    }

    if (glassesImage?.complete) {
      drawGlasses(detections, image);
    }
  } catch (error) {
    console.error('Detection error:', error);
  }
}

// Enhanced Glasses Drawing with Angle Adjustment
function drawGlasses(detections, sourceElement) {
  const landmarks = detections.landmarks;
  const jawOutline = landmarks.getJawOutline();
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  const sourceWidth = sourceElement.videoWidth || sourceElement.width;
  const sourceHeight = sourceElement.videoHeight || sourceElement.height;
  const scaleX = faceOverlayCanvas.width / sourceWidth;
  const scaleY = faceOverlayCanvas.height / sourceHeight;

  // Calculate face angle using jaw landmarks
  const leftJaw = jawOutline[0];
  const rightJaw = jawOutline[16];
  const faceAngle = Math.atan2(
    (rightJaw.y - leftJaw.y) * scaleY,
    (rightJaw.x - leftJaw.x) * scaleX
  );

  // Calculate eye centers
  const leftEyeCenter = {
    x: (leftEye[3].x + leftEye[0].x) / 2 * scaleX,
    y: (leftEye[3].y + leftEye[0].y) / 2 * scaleY
  };
  const rightEyeCenter = {
    x: (rightEye[3].x + rightEye[0].x) / 2 * scaleX,
    y: (rightEye[3].y + rightEye[0].y) / 2 * scaleY
  };

  // Calculate glasses dimensions with 1.5x horizontal size
  const eyeDistance = Math.sqrt(
    Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
    Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
  );
  
  // 1.5x wider default glasses
  const frameWidth = frameWidthInput.value ? parseFloat(frameWidthInput.value) : eyeDistance * 2.3;
  const frameHeight = frameHeightInput.value ? parseFloat(frameHeightInput.value) : frameWidth * 0.3;

  // Calculate center position between eyes
  const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
  const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2;

  // Clear previous drawing
  glassesOverlayCtx.clearRect(0, 0, glassesOverlayCanvas.width, glassesOverlayCanvas.height);

  // Save context state before transformation
  glassesOverlayCtx.save();
  
  // Move to center point and rotate
  glassesOverlayCtx.translate(centerX, centerY);
  glassesOverlayCtx.rotate(faceAngle);
  
  // Draw glasses centered at (0,0) after transformation
  glassesOverlayCtx.drawImage(
    glassesImage, 
    -frameWidth / 2, 
    -frameHeight / 1.8,
    frameWidth, 
    frameHeight
  );
  
  // Restore context state
  glassesOverlayCtx.restore();

  // Debug visualization
  if (DEBUG_MODE) {
    drawDebugPoints(landmarks, scaleX, scaleY, centerX, centerY, faceAngle);
  }
}

// Debug visualization
function drawDebugPoints(landmarks, scaleX, scaleY, centerX, centerY, faceAngle) {
  faceOverlayCtx.clearRect(0, 0, faceOverlayCanvas.width, faceOverlayCanvas.height);
  
  // Draw jaw line
  const jaw = landmarks.getJawOutline();
  faceOverlayCtx.beginPath();
  faceOverlayCtx.moveTo(jaw[0].x * scaleX, jaw[0].y * scaleY);
  for (let i = 1; i < jaw.length; i++) {
    faceOverlayCtx.lineTo(jaw[i].x * scaleX, jaw[i].y * scaleY);
  }
  faceOverlayCtx.strokeStyle = 'red';
  faceOverlayCtx.stroke();

  // Draw eyes
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  drawLandmark(leftEye, 'green');
  drawLandmark(rightEye, 'green');

  // Draw center point
  faceOverlayCtx.fillStyle = 'blue';
  faceOverlayCtx.beginPath();
  faceOverlayCtx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
  faceOverlayCtx.fill();

  // Draw angle indicator
  faceOverlayCtx.strokeStyle = 'yellow';
  faceOverlayCtx.lineWidth = 2;
  faceOverlayCtx.beginPath();
  faceOverlayCtx.moveTo(centerX, centerY);
  faceOverlayCtx.lineTo(
    centerX + 50 * Math.cos(faceAngle),
    centerY + 50 * Math.sin(faceAngle)
  );
  faceOverlayCtx.stroke();

  function drawLandmark(points, color) {
    faceOverlayCtx.fillStyle = color;
    points.forEach(point => {
      faceOverlayCtx.beginPath();
      faceOverlayCtx.arc(point.x * scaleX, point.y * scaleY, 3, 0, 2 * Math.PI);
      faceOverlayCtx.fill();
    });
  }
}

// Event Handlers
function toggleInputMode() {
  const mode = inputMode.value;
  if (mode === 'webcam') {
    startWebcam();
    uploadedImage.style.display = 'none';
    uploadSection.style.display = 'none';
  } else {
    stopWebcam();
    uploadedImage.style.display = 'block';
    uploadSection.style.display = 'block';
  }
}

uploadBtn.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedFaceImage = new Image();
    uploadedFaceImage.onload = () => {
      uploadedImage.src = event.target.result;
      detectFaceAndDrawGlasses(uploadedFaceImage);
    };
    uploadedFaceImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

uploadGlassesBtn.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      processGlassesImage(img, (processedImg) => {
        glassesImage = processedImg;
        if (isWebcamActive) detectWebcamFaces();
        else if (uploadedFaceImage) detectFaceAndDrawGlasses(uploadedFaceImage);
      });
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// Frame dimension inputs
frameWidthInput.addEventListener('input', () => {
  if (isWebcamActive && glassesImage) detectWebcamFaces();
  else if (uploadedFaceImage && glassesImage) detectFaceAndDrawGlasses(uploadedFaceImage);
});

frameHeightInput.addEventListener('input', () => {
  if (isWebcamActive && glassesImage) detectWebcamFaces();
  else if (uploadedFaceImage && glassesImage) detectFaceAndDrawGlasses(uploadedFaceImage);
});

// Initialize
inputMode.addEventListener('change', toggleInputMode);
loadModels();