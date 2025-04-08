import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { supabase } from "../../../services/supabaseClient.jsx"; // Adjust path if needed
import Footer from "../Footer/Footer";

// ✅ Rectangle component to display event details
function EventRectangle({ event, userId, checkOutTime }) {
  const navigate = useNavigate();
  const eventDate = new Date(event.date);
  const today = new Date();

  let bgColor = "bg-[#2A2A2A]"; // Default background

  if (eventDate > today) {
    bgColor = "bg-[#2A5D09]"; // ✅ Future event (Green)
  } else if (!checkOutTime) {
    bgColor = "bg-[#FF0000]"; // ✅ Past event without check_out_time (Red)
  }

  return (
    <div
      className={`${bgColor} p-4 rounded-md mb-4 w-full h-24 flex flex-col justify-center items-start border border-white cursor-pointer hover:bg-[#3A3A3A] transition`}
      onClick={() => navigate(`/afterregistration/${event.id}/${userId}`)} // ✅ Navigate on click
    >
      <p className="text-lg font-semibold text-white">{event.title}</p>
      <p className="text-sm text-gray-400">{event.date}</p>
      {checkOutTime && (
        <p className="text-xs text-gray-300">Checked out at: {checkOutTime}</p> // ✅ Display check-out time if available
      )}
    </div>
  );
}

// ✅ Registered Events Page
function RegisteredEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      setLoading(true);
      setError("");

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      setUserId(authData.user.id); // ✅ Store user ID

      // ✅ Fetch registered events from "registrations" table with event details and check_out_time
      const { data, error: fetchError } = await supabase
        .from("registrations")
        .select("event_id, check_out_time, events(id, title, date)") // ✅ Ensure check_out_time is included
        .eq("attendee_id", authData.user.id);

      if (fetchError) {
        console.error("Supabase Error:", fetchError);
        setError("Failed to fetch registered events.");
      } else {
        // ✅ Sort events in newest-first order (latest on top)
        const sortedEvents = (data || []).sort(
          (a, b) => new Date(b.events.date) - new Date(a.events.date)
        );
        setEvents(sortedEvents);
      }

      setLoading(false);
    };

    fetchRegisteredEvents();
  }, []);

  return (
    <div className="bg-[#1E1E1E] w-screen min-h-screen flex flex-col text-white py-10 pb-24">
      {/* Title (No longer sticky) */}
      <h1 className="text-2xl font-bold text-center mb-6">
        Registered Events
      </h1>

      {/* Events List */}
      <div className="w-[80%] max-w-lg mx-auto">
        {loading ? (
          <p className="text-gray-400">Loading events...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-gray-400">No registered events found.</p>
        ) : (
          events.map((event, index) => (
            <EventRectangle
              key={index}
              event={event.events}
              userId={userId}
              checkOutTime={event.check_out_time} // ✅ Pass check_out_time to EventRectangle
            />
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}

export default RegisteredEvents;
