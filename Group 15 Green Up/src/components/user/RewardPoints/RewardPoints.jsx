import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabaseClient.jsx";
import Footer from '../Footer/Footer.jsx'

function RewardPoints() {
  const { attendee_id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!attendee_id) {
        setError("Invalid Attendee ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data: registrationsData, error: registrationsError } = await supabase
        .from("registrations")
        .select("event_id, points_awarded")
        .eq("attendee_id", attendee_id)
        .not("points_awarded", "is", null);

      if (registrationsError) {
        setError("Failed to fetch registrations.");
        setLoading(false);
        return;
      }

      if (registrationsData.length === 0) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      const eventIds = registrationsData.map((entry) => entry.event_id);
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title, sponsor_id")
        .in("id", eventIds);

      if (eventsError) {
        setError("Failed to fetch event details.");
        setLoading(false);
        return;
      }

      const sponsorIds = eventsData
        .map((event) => event.sponsor_id)
        .filter((id) => id !== null);
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from("sponsors")
        .select("id, name")
        .in("id", sponsorIds);

      if (sponsorsError) {
        setError("Failed to fetch sponsor names.");
        setLoading(false);
        return;
      }

      const sponsorMap = sponsorsData.reduce((acc, sponsor) => {
        acc[sponsor.id] = sponsor.name;
        return acc;
      }, {});

      const eventMap = eventsData.reduce((acc, event) => {
        acc[event.id] = {
          title: event.title,
          sponsorName: event.sponsor_id ? sponsorMap[event.sponsor_id] : "No Sponsor"
        };
        return acc;
      }, {});

      const enrichedRegistrations = registrationsData.map((entry) => ({
        ...entry,
        title: eventMap[entry.event_id]?.title || "Unknown Event",
        sponsorName: eventMap[entry.event_id]?.sponsorName || "No Sponsor",
      }));

      setRegistrations(enrichedRegistrations);
      setLoading(false);
    };

    fetchRegistrations();
  }, [attendee_id]);

  const handleBackClick = () => {
    navigate("/userprofile");
  };

  const handleEventClick = (eventId) => {
    navigate(`/redeem/${eventId}/${attendee_id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E1E1E] text-[#F5F5F5]">
      <div className="w-full max-w-md">
        <button
          onClick={handleBackClick}
          className="mb-4 text-[#F5F5F5] bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center"
        >
          ← Back to Profile
        </button>

        <h1 className="text-2xl font-bold mb-4">Reward Points</h1>

        {loading ? (
          <p className="text-gray-400 mt-4">Loading...</p>
        ) : error ? (
          <p className="text-red-400 mt-4">{error}</p>
        ) : registrations.length === 0 ? (
          <p className="text-gray-400 mt-4">No points awarded yet.</p>
        ) : (
          <div className="mt-6 w-full">
            <h2 className="text-xl font-semibold mb-2">Events & Points</h2>
            <ul className="w-full space-y-2">
              {registrations.map((entry, index) => (
                <li 
                  key={index} 
                  className="bg-gray-800 p-3 rounded-md cursor-pointer hover:bg-gray-700"
                  onClick={() => handleEventClick(entry.event_id)}
                >
                  <div className="flex justify-between">
                    <p>🎟 Event: {entry.title}</p>
                    <p className="text-gray-300">Sponsor: {entry.sponsorName}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>🏆 Points Awarded: {entry.points_awarded}</p>
                    <p className="text-gray-300"></p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}

export default RewardPoints;