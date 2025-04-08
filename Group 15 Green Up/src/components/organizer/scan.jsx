import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { supabase } from "./../../services/supabaseClient";
import RewardPointsModal from "../ui/RewardPointsModal"; // Import the modal

const QRScanner = ({ eventId }) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false); // State for reward points modal
  const [maxPoints, setMaxPoints] = useState(0); // State to store max reward points
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
          processQRCode(qrCode.data);
        } else {
          setError("No QR code found in the uploaded file.");
          setScanResult(null);
        }
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setIsCameraActive(true);
    } catch (err) {
      setError("Failed to access camera: " + err.message);
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          videoRef.current.srcObject = stream;
          requestAnimationFrame(scanCamera);
        } catch (err) {
          setError("Failed to access camera: " + err.message);
          setIsCameraActive(false);
        }
      };
      startStream();
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const scanCamera = () => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

      if (qrCode) {
        processQRCode(qrCode.data);
        stopCamera();
        return;
      }
    }
    requestAnimationFrame(scanCamera);
  };

  const processQRCode = (qrData) => {
    try {
      const scannedData = JSON.parse(qrData);
      if (scannedData.event_id !== eventId) {
        setError("Scanned QR code does not match the event.");
        setScanResult(null);
        return;
      }

      setScanResult(scannedData);
      setError(null);
      handleCheckInOut(scannedData.attendee_id, scannedData.event_id);
    } catch (err) {
      setError("Invalid QR Code format.");
      setScanResult(null);
    }
  };

  const handleCheckInOut = async (attendeeId, eventId) => {
    if (!attendeeId || !eventId) {
      setError("Invalid QR Code: Missing attendeeId or eventId.");
      return;
    }

    try {
      const { data: registration, error: regError } = await supabase
        .from("registrations")
        .select("check_in_time, check_out_time, points_awarded")
        .eq("attendee_id", attendeeId)
        .eq("event_id", eventId)
        .single();

      if (regError) {
        setError(`Error fetching registration details: ${regError.message}`);
        return;
      }

      const currentTime = new Date().toISOString();

      if (!registration.check_in_time) {
        await supabase
          .from("registrations")
          .update({ check_in_time: currentTime })
          .eq("attendee_id", attendeeId)
          .eq("event_id", eventId);

        setScanResult((prev) => ({
          ...prev,
          check_in_time: currentTime,
        }));
      } else if (registration.check_in_time && !registration.check_out_time) {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("reward_points")
          .eq("id", eventId)
          .single();

        if (eventError || !eventData) {
          setError(`Error retrieving event reward points: ${eventError?.message || "No data"}`);
          return;
        }

        setMaxPoints(eventData.reward_points); // Store max points for the modal
        setIsRewardModalOpen(true); // Open the modal instead of prompt
      } else if (registration.check_in_time && registration.check_out_time) {
        setError("This user has already checked in and out.");
      }
    } catch (err) {
      setError(`Database update failed: ${err.message}`);
      console.error("Unexpected error:", err);
    }
  };

  const handleRewardPointsSubmit = async (pointsAwarded) => {
    try {
      const currentTime = new Date().toISOString();

      // Update registrations table
      const { error: regUpdateError } = await supabase
        .from("registrations")
        .update({ check_out_time: currentTime, points_awarded: pointsAwarded })
        .eq("attendee_id", scanResult.attendee_id)
        .eq("event_id", eventId);

      if (regUpdateError) {
        setError(`Error updating registrations: ${regUpdateError.message}`);
        return;
      }

      // Fetch current reward_points from participants table
      const { data: participantData, error: participantError } = await supabase
        .from("participants")
        .select("reward_points")
        .eq("id", scanResult.attendee_id)
        .single();

      if (participantError) {
        setError(`Error fetching participant's reward points: ${participantError.message}`);
        return;
      }

      // Calculate new total reward points
      const currentRewardPoints = participantData.reward_points || 0; // Default to 0 if null
      const newTotalPoints = currentRewardPoints + pointsAwarded;

      console.log(`Updating participant ${scanResult.attendee_id}: Current Points: ${currentRewardPoints}, New Points: ${pointsAwarded}, Total: ${newTotalPoints}`);

      // Update participants table with new total
      const { data: updatedParticipant, error: updateError } = await supabase
        .from("participants")
        .update({ reward_points: newTotalPoints })
        .eq("id", scanResult.attendee_id)
        .select(); // Return the updated row for verification

      if (updateError) {
        setError(`Error updating participant's reward points: ${updateError.message}`);
        console.error("Update error details:", updateError);
        return;
      }

      console.log("Successfully updated participant:", updatedParticipant);

      setScanResult((prev) => ({
        ...prev,
        check_out_time: currentTime,
        points_awarded: pointsAwarded,
      }));
      setIsRewardModalOpen(false); // Close the modal after submission
    } catch (err) {
      setError(`Failed to update check-out details: ${err.message}`);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center pb-20">
      <div className="w-full max-w-md flex flex-col items-center space-y-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mt-4">QR Code Scanner</h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="my-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <div className="my-4">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Start Camera Scanner
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Stop Camera
            </button>
          )}
        </div>

        {isCameraActive && <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-lg shadow-md" />}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {scanResult && (
  <div className="mt-4 w-full text-center">
    {scanResult.check_in_time && !scanResult.check_out_time && (
      <p className="text-green-600 font-semibold text-lg">✅ Checked In</p>
    )}
    {scanResult.check_out_time && (
      <>
        <p className="text-blue-600 font-semibold text-lg">✅ Checked Out</p>
        <p className="text-gray-700 text-sm mt-1">
          Reward Points Awarded: <span className="font-bold">{scanResult.points_awarded}</span>
        </p>
      </>
    )}
  </div>
)}

      </div>

      {/* Add the RewardPointsModal */}
      <RewardPointsModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        onSubmit={handleRewardPointsSubmit}
        maxPoints={maxPoints}
      />
    </div>
  );
};

export default QRScanner;