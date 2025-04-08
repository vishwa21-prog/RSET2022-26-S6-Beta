import React from "react";
import { FaHome, FaPlus, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom"; // Use Link instead of <a> for React Router

const OrganizerFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-green-800 py-2 flex justify-center space-x-6 text-white z-50">
      {[
        { icon: <FaHome />, tooltip: "Home", link: "/organizer/events" },
        { icon: <FaPlus />, tooltip: "Create New", link: "/organizenew" },
        { icon: <FaUser />, tooltip: "Organizer Info", link: "/organizer/profile" },
      ].map((item, index) => (
        <div key={index} className="relative flex flex-col items-center">
          <Link to={item.link}>
            <button
              className="bg-green-500 w-12 h-12 flex items-center justify-center rounded-full border-none text-2xl shadow-md transition-transform transform hover:bg-green-400 hover:-translate-y-1 hover:shadow-lg"
              aria-label={item.tooltip}
            >
              {item.icon}
            </button>
          </Link>
          <div className="absolute bottom-14 bg-green-500 text-white text-xs px-2 py-1 rounded opacity-0 transition-opacity duration-300 whitespace-nowrap pointer-events-none group-hover:opacity-100">
            {item.tooltip}
          </div>
        </div>
      ))}
    </footer>
  );
};

export default OrganizerFooter;
