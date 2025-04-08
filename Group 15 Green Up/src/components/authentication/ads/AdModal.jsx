import React from "react";

const AdModal = ({ ad, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
        >
          ❌
        </button>

        {/* Ad Content */}
        <h2 className="text-xl font-bold mb-2 text-center">{ad.title}</h2>
        <p className="text-gray-700 text-center">{ad.description}</p>

        {/* CTA Button */}
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-blue-500 text-white text-center py-2 mt-4 rounded-md hover:bg-blue-600 transition"
        >
          {ad.buttonText}
        </a>
      </div>
    </div>
  );
};

export default AdModal;
