import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import { supabase } from "../../services/supabaseClient";
import QRScanner from "./scan";
import OrganizerFooter from "./OrganizerFooter";

const EventDetailsOrg = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setEvent(data);
    };

    fetchEvent();
  }, [id]);

  if (!event) return <p className="text-center mt-10">Loading...</p>;

  const handleEditClick = () => {
    navigate(`/edit/${event.id}`); // Navigate to edit page
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <button
          onClick={handleEditClick}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          Edit Event
        </button>
      </div>
      <p className="text-gray-600 mt-2">{event.description}</p>
      <p className="text-gray-600 mt-2">
        📍 {event.location} | 🗓 {event.date}
      </p>
      <img src={event.images} alt="Event" className="mt-4 rounded-md" />
      <h2 className="text-xl font-semibold mt-6">Check-in Scanner</h2>
      <QRScanner eventId={event.id} />
      <OrganizerFooter />
    </div>
  );
};

export default EventDetailsOrg;