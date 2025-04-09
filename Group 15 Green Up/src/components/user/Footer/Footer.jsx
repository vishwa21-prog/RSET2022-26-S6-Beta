import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import viewAll from "../../../assets/viewAll.svg";
import registeredEvents from "../../../assets/registeredEvents.svg";
import nearbyEvents from "../../../assets/nearbyEvents.svg";
import user from "../../../assets/user.svg";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    // Set active tab based on current URL
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  return (
    <footer className="w-full h-[10vh] bg-[#2A2A2A] fixed bottom-0 left-0 flex justify-between items-center px-[10%]">
      <div
        className={`w-12 h-12 rounded-full flex justify-center items-center border p-2 cursor-pointer ${
          activeTab === "/allevents" ? "bg-[#aed36c] border-[#aed36c]" : "bg-[#2a5d09] border-[#2a5d09]"
        }`}
        onClick={() => handleNavigation("/allevents")}
      >
        <img 
          src={viewAll} 
          alt="View All" 
          className={`w-6 h-6 object-contain ${activeTab === "/allevents" ? "filter invert-[0%] brightness-0" : ""}`} 
        />
      </div>

      <div
        className={`w-12 h-12 rounded-full flex justify-center items-center border p-2 cursor-pointer ${
          activeTab === "/registeredevents" ? "bg-[#aed36c] border-[#aed36c]" : "bg-[#2a5d09] border-[#2a5d09]"
        }`}
        onClick={() => handleNavigation("/registeredevents")}
      >
        <img 
          src={registeredEvents} 
          alt="Registered Events" 
          className={`w-6 h-6 object-contain ${activeTab === "/registeredevents" ? "filter invert-[0%] brightness-0" : ""}`} 
        />
      </div>

      <div
        className={`w-12 h-12 rounded-full flex justify-center items-center border p-2 cursor-pointer ${
          activeTab === "/events" ? "bg-[#aed36c] border-[#aed36c]" : "bg-[#2a5d09] border-[#2a5d09]"
        }`}
        onClick={() => handleNavigation("/events")}
      >
        <img 
          src={nearbyEvents} 
          alt="Nearby Events" 
          className={`w-6 h-6 object-contain ${activeTab === "/events" ? "filter invert-[0%] brightness-0" : ""}`} 
        />
      </div>

      <div
        className={`w-12 h-12 rounded-full flex justify-center items-center border p-2 cursor-pointer ${
          activeTab === "/userprofile" ? "bg-[#aed36c] border-[#aed36c]" : "bg-[#2a5d09] border-[#2a5d09]"
        }`}
        onClick={() => handleNavigation("/userprofile")}
      >
        <img 
          src={user} 
          alt="User Profile" 
          className={`w-6 h-6 object-contain ${activeTab === "/userprofile" ? "filter invert-[0%] brightness-0" : ""}`} 
        />
      </div>
    </footer>
  );
};

export default Footer;
