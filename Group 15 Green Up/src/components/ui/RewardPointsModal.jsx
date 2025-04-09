import React, { useState } from "react";

const RewardPointsModal = ({ isOpen, onClose, onSubmit, maxPoints }) => {
  const [points, setPoints] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedPoints = parseInt(points, 10);
    if (isNaN(parsedPoints) || parsedPoints < 0 || parsedPoints > maxPoints) {
      alert(`Invalid reward points. Enter a value between 0 and ${maxPoints}.`);
      return;
    }
    onSubmit(parsedPoints);
    setPoints(""); // Reset input after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Enter Reward Points</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter reward points (0 - {maxPoints}):
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            min="0"
            max={maxPoints}
            className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter points"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RewardPointsModal;