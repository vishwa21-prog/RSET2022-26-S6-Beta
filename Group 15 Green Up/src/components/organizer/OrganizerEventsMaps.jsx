import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "./../../services/supabaseClient";
import Maps from "./../Maps/Maps";
import OrganizerFooter from "./OrganizerFooter";

const OrganizerEventsMap = () => {
  const [eventLocations, setEventLocations] = useState([]);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return; // Ensure userId is available before fetching events

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, latitude, longitude, organizer_id");

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEventLocations(data);
        // Identify events where the organizer_id matches the logged-in user
        const userEventIds = data.filter(event => event.organizer_id === userId).map(event => event.id);
        setHighlightedIds(userEventIds);
      }
    };

    fetchEvents();
  }, [userId]); // Depend on userId to fetch events only after it's available

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 relative">
      {/* ✅ Narrower "Events" button */}
      <button
        onClick={() => navigate("/organizer/events")}
        className="absolute top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700 transition-all w-fit max-w-xs min-w-0 text-sm !w-auto"
      >
        View
      </button>


      <h1 className="text-2xl font-semibold mb-4">Your Organized Events</h1>
      <Maps eventLocations={eventLocations} highlightedIds={highlightedIds} />
      <OrganizerFooter />
    </div>
  );
};

export default OrganizerEventsMap;
