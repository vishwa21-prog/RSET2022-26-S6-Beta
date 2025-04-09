import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import OrganizerFooter from "./OrganizerFooter";

const OrganizerChatList = () => {
  const { eventId } = useParams(); // Get eventId from URL
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchAttendees = async () => {
      setLoading(true);
      setErrorMessage("");

      // Step 1: Get logged-in user details
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        setErrorMessage("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      const userEmail = authData.user.email;

      // Step 2: Get organizer ID using email
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

      // Step 3: Fetch messages matching organizer_id and event_id
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("attendee_id")
        .eq("event_id", eventId)
        .eq("organizer_id", organizerId); // Assumes messages table has organizer_id

      if (messagesError) {
        setErrorMessage("Error fetching messages.");
        console.error("Messages error:", messagesError);
        setLoading(false);
        return;
      }

      if (!messages || messages.length === 0) {
        setErrorMessage("No attendees have started a chat for this event.");
        setLoading(false);
        return;
      }

      // Step 4: Get unique attendee IDs
      const uniqueAttendeeIds = [...new Set(messages.map((msg) => msg.attendee_id))];

      // Step 5: Fetch names from participants table
      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("id, name")
        .in("id", uniqueAttendeeIds);

      if (participantsError) {
        setErrorMessage("Error fetching attendee names.");
        console.error("Participants error:", participantsError);
        setLoading(false);
        return;
      }

      // Step 6: Map attendee IDs to names
      const attendeesWithNames = uniqueAttendeeIds.map((id) => {
        const participant = participants.find((p) => p.id === id);
        return {
          attendee_id: id,
          name: participant ? participant.name : "Unknown Attendee",
        };
      });

      setAttendees(attendeesWithNames);
      setLoading(false);
    };

    fetchAttendees();
  }, [eventId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Attendees with Chats</h1>
        <button
          onClick={() => navigate(`/organizer/events`)}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all"
        >
          Back to Events
        </button>
      </div>

      {/* Loading/Error States */}
      {loading && <p className="text-center text-gray-600">Loading attendees...</p>}
      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}

      {/* Attendees List */}
{!loading && !errorMessage && attendees.length > 0 && (
  <div className="flex-1 px-4 py-6">
    <ul className="space-y-4">
      {attendees.map((attendee) => (
        <li
          key={attendee.attendee_id}
          className="bg-white shadow-md rounded-lg p-4 text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-200 transition-all"
          onClick={() => navigate(`/organizer/chat/${eventId}/${attendee.attendee_id}`)}
        >
          {attendee.name}
        </li>
      ))}
    </ul>
  </div>
)}


      <OrganizerFooter />
    </div>
  );
};

export default OrganizerChatList;