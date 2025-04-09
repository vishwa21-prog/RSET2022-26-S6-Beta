import { useEffect, useState } from "react";
import { supabase } from "./../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import OrganizerFooter from "./OrganizerFooter";

const OrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setErrorMessage("");

      // ✅ Get logged-in user details
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        setErrorMessage("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      const userEmail = authData.user.email;

      // ✅ Get organizer ID using email
      const { data: organizer, error: organizerError } = await supabase
        .from("organizers")
        .select("id")
        .eq("email_id", userEmail)
        .single();

      if (organizerError || !organizer) {
        setErrorMessage("You are not registered as an organizer.");
        setLoading(false);
        return;
      }

      const organizerId = organizer.id;

      // ✅ Fetch events for the logged-in organizer
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", organizerId);

      if (error) {
        setErrorMessage("Error fetching events.");
      } else if (data.length === 0) {
        setErrorMessage("No events found.");
      } else {
        setEvents(data);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* ✅ Header Section with Navigation Button */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
       
      </div>

      {loading && <p className="text-center text-gray-600">Loading events...</p>}
      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

      {!loading && !errorMessage && events.length > 0 && (
        <div className="flex-1 px-4">
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:bg-gray-100 transition-all"
                onClick={() => navigate(`/organizer/event/${event.id}`)}
              >
                {/* Event Image */}
                <img
                  src={event.images || "/placeholder.jpg"}
                  alt={event.title}
                  className="w-24 h-24 object-cover rounded-l-lg"
                />
                
                {/* Event Details */}
                <div className="p-4 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
                  <p className="text-sm text-gray-600">{event.date}</p>
                  {/* Chat Button with stopPropagation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent bubbling to <li>
                      navigate(`/organizer/event/${event.id}/chat`);
                    }}
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all"
                  >
                    Chat with Attendees
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ Button to go to profile */}
      <div className="flex justify-center py-4">
        <button
          onClick={() => navigate("/organizer/profile")}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-700 transition-all"
        >
          Go to Profile
        </button>
      </div>

      {/* Organizer Footer */}
      <OrganizerFooter />
    </div>
  );
};

export default OrganizerEvents;