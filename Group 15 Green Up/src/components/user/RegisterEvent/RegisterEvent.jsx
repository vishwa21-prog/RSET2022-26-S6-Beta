import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import Location from "../Location/Location";
import { supabase } from "../../../services/supabaseClient";
import dateicon from "../../../assets/date.svg";
import timeicon from "../../../assets/time.svg";
import locationicon from "../../../assets/location.svg";

function RegisterEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [eventAddress, setEventAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;

      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user?.id) {
        setLoading(false);
        return;
      }
      const userId = user.user.id;

      const { data: registration } = await supabase
        .from("registrations")
        .select("id, event_id, attendee_id")
        .eq("event_id", id)
        .eq("attendee_id", userId)
        .maybeSingle();

      if (registration) {
        navigate(`/afterregistration/${id}/${userId}`);
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("images, title, description, date, start_time, end_time, latitude, longitude, reward_points")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error.message);
        setLoading(false);
        return;
      }

      setEventData(data);
      fetchAddressFromCoordinates(data.latitude, data.longitude);
      setLoading(false);
    }

    fetchEvent();
  }, [id, navigate]);

  async function fetchAddressFromCoordinates(lat, lon) {
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!API_KEY) return;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      setEventAddress(result.results[0]?.formatted_address || "Unknown Location");
    } catch {
      setEventAddress("Unknown Location");
    }
  }

  async function handleRegister() {
    if (!id) return;

    setRegistering(true);
    setRegistrationMessage("");

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user?.id) {
      setRegistrationMessage("Please log in to register for the event.");
      setRegistering(false);
      return;
    }

    const userId = user.user.id;
    const { data: attendee } = await supabase
      .from("participants")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!attendee) {
      setRegistrationMessage("User does not exist in the participants table.");
      setRegistering(false);
      return;
    }

    const { error } = await supabase
      .from("registrations")
      .insert([{ attendee_id: userId, event_id: id }]);

    if (error) {
      setRegistrationMessage("Failed to register. Try again.");
    } else {
      navigate(`/afterregistration/${id}/${userId}`);
    }

    setRegistering(false);
  }

  if (loading) return <p className="text-[#F5F5F5]">Loading event details...</p>;
  if (!eventData) return <p className="text-[#F5F5F5]">Event not found.</p>;

  return (
    <>
      <main className="flex flex-col items-center justify-center bg-[#1E1E1E] text-[#F5F5F5] w-full min-h-screen py-6">
        <Location latitude={eventData.latitude} longitude={eventData.longitude} />
        <div className="w-full max-w-lg bg-[#1E1E1E] p-6 rounded-lg shadow-lg text-center">
          <img className="w-full h-40 object-cover rounded-lg" src={eventData.images} alt="Event" />
          <h1 className="text-2xl font-bold mt-4">{eventData.title}</h1>
          <p className="mt-2 text-lg text-[#F5F5F5]">{eventData.description}</p>
          <div className="flex items-center justify-center mt-4 text-[#F5F5F5]">
            <img src={dateicon} alt="Date Icon" className="w-5 h-5 mr-2" />
            <p>{new Date(eventData.date).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center justify-center mt-2 text-[#F5F5F5]">
            <img src={timeicon} alt="Time Icon" className="w-5 h-5 mr-2" />
            <p>{eventData.start_time} - {eventData.end_time}</p>
          </div>
          <div className="flex items-center justify-center mt-2 text-[#F5F5F5]">
            <img src={locationicon} alt="Location Icon" className="w-5 h-5 mr-2" />
            <p>{eventAddress}</p>
          </div>
          <button
            className="w-full bg-green-500 text-black font-bold py-3 mt-4 rounded-lg hover:bg-green-600 transition"
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? "Registering..." : "Register Now"}
          </button>
          {registrationMessage && <p className="mt-2 text-sm text-[#F5F5F5]">{registrationMessage}</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default RegisterEvent;
