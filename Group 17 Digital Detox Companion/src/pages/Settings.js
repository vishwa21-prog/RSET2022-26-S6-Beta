import React, { useState } from "react";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [screenTimeLimit, setScreenTimeLimit] = useState(2); // Default: 2 hours
  const [workSites, setWorkSites] = useState([]);
  const [entertainmentSites, setEntertainmentSites] = useState([]);

  const handleSave = () => {
    localStorage.setItem("darkMode", darkMode);
    localStorage.setItem("notifications", notifications);
    localStorage.setItem("screenTimeLimit", screenTimeLimit);
    localStorage.setItem("workSites", JSON.stringify(workSites));
    localStorage.setItem("entertainmentSites", JSON.stringify(entertainmentSites));
    alert("Settings saved!");
  };

  return (
    <div className={`w-screen h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} p-6`}>
      <h2 className="text-3xl font-bold mb-6">⚙️ Settings</h2>
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-md w-full">
        
        {/* Dark Mode Toggle */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg">Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-all ${
              darkMode ? "justify-end" : "justify-start"
            }`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
          </button>
        </div>

        {/* Notifications Toggle */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg">Notifications</span>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-all ${
              notifications ? "justify-end" : "justify-start"
            }`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
          </button>
        </div>

        {/* Screen Time Limit */}
        <div className="mb-4">
          <label className="block text-lg">Screen Time Limit (Hours)</label>
          <input
            type="number"
            min="1"
            max="12"
            value={screenTimeLimit}
            onChange={(e) => setScreenTimeLimit(e.target.value)}
            className="w-full mt-2 p-2 border rounded-md"
          />
        </div>

        {/* Categorization */}
        <div className="mb-4">
          <label className="block text-lg">Work Websites</label>
          <input
            type="text"
            placeholder="Add work websites (comma separated)"
            className="w-full mt-2 p-2 border rounded-md"
            onBlur={(e) => setWorkSites(e.target.value.split(","))}
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg">Entertainment Websites</label>
          <input
            type="text"
            placeholder="Add entertainment websites (comma separated)"
            className="w-full mt-2 p-2 border rounded-md"
            onBlur={(e) => setEntertainmentSites(e.target.value.split(","))}
          />
        </div>

        {/* Save Button */}
        <button onClick={handleSave} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
