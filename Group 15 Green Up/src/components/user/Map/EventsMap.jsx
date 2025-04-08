import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import { supabase } from "./../../../services/supabaseClient";
import Maps from "./../../Maps/Maps";
import Footer from "../Footer/Footer";

const EventsMap = () => {
  const [eventLocations, setEventLocations] = useState([]);
  const navigate = useNavigate();  // Initialize navigate function

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("id, title, description, latitude, longitude");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEventLocations(data);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        {/* ✅ Button to navigate to /events */}
        <button
          onClick={() => navigate("/events")}  // This will navigate to /events
          className="absolute top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700 transition-all w-fit max-w-xs min-w-0 text-sm !w-auto"
        >
          List View
        </button>
        
        <h1>All Events Map</h1>
        <Maps eventLocations={eventLocations} highlightedIds={[]} />
      </div>

      {/* ✅ Corrected Footer placement */}
      <Footer />
    </div>
  );
};

export default EventsMap;
