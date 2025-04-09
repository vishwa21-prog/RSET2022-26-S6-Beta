import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./../../services/supabaseClient";
import OrganizerFooter from "./OrganizerFooter";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    latitude: null,
    longitude: null,
    max_participants: "",
    reward_points: "",
    images: "",
  });
  const [originalEventData, setOriginalEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [locationDebug, setLocationDebug] = useState("");

  // Fetch event data on mount and reverse geocode if needed
  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        const fetchedData = {
          title: data.title || "",
          description: data.description || "",
          date: data.date || "",
          start_time: data.start_time || "",
          end_time: data.end_time || "",
          location: "",
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          max_participants: data.max_participants || "",
          reward_points: data.reward_points || "",
          images: data.images || "",
        };
        setEventData(fetchedData);
        setOriginalEventData(fetchedData);

        if (data.latitude && data.longitude) {
          fetchLocationFromCoordinates(data.latitude, data.longitude);
        } else {
          setLocationDebug("No coordinates available");
        }
      } else {
        alert("Error fetching event: " + error.message);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "location") {
      setLocationDebug(`Input: ${value}`);
      fetchCoordinates(value);
    }
  };

  const fetchCoordinates = async (address) => {
    if (!address) {
      setLocationDebug("No address provided");
      setEventData((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
      }));
      return;
    }

    try {
      const fullAddress = `${address}, Kochi, Kerala, India`;
      const encodedAddress = encodeURIComponent(fullAddress.trim());
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setEventData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
        }));
        setLocationDebug(`Found: ${display_name} (Lat: ${lat}, Lon: ${lon})`);
      } else {
        setLocationDebug("No coordinates found for this address");
        setEventData((prev) => ({
          ...prev,
          latitude: null,
          longitude: null,
        }));
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      setLocationDebug("Error fetching coordinates");
      setEventData((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
      }));
    }
  };

  const fetchLocationFromCoordinates = async (lat, lon) => {
    if (!lat || !lon) {
      setLocationDebug("No coordinates available for reverse geocoding");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        setEventData((prev) => ({
          ...prev,
          location: data.display_name,
        }));
        setLocationDebug(`Reverse geocoded: ${data.display_name}`);
      } else {
        setLocationDebug("No location name found for these coordinates");
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setLocationDebug("Error fetching location name");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadStatus(`File selected: ${file.name}`);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("No file selected.");
      return;
    }

    setUploadStatus("Uploading...");
    const fileName = `${Date.now()}_${selectedFile.name}`;

    const { data, error } = await supabase.storage
      .from("event_images")
      .upload(fileName, selectedFile);

    if (error) {
      setUploadStatus("Error uploading file.");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("event_images")
      .getPublicUrl(fileName);

    setEventData((prev) => ({
      ...prev,
      images: urlData.publicUrl,
    }));

    setUploadStatus("Upload successful!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      alert("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    const userEmail = authData.user.email;

    const { data: organizer, error: organizerError } = await supabase
      .from("organizers")
      .select("id")
      .eq("email_id", userEmail)
      .single();

    if (organizerError || !organizer) {
      alert("You are not registered as an organizer. Please sign up first.");
      setLoading(false);
      return;
    }

    const organizerId = organizer.id;

    const updates = {};
    if (originalEventData) {
      Object.keys(eventData).forEach((key) => {
        if (eventData[key] !== originalEventData[key]) {
          if (key === "latitude" || key === "longitude") {
            updates[key] = Number(eventData[key]) || null;
          } else if (key === "max_participants" || key === "reward_points") {
            updates[key] = Number(eventData[key]);
          } else if (key !== "location") {
            updates[key] = eventData[key];
          }
        }
      });
    }

    updates.organizer_id = organizerId;

    if (Object.keys(updates).length > 1) {
      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id);

      setLoading(false);

      if (error) {
        alert("Error updating event: " + error.message);
      } else {
        alert("Event updated successfully!");
        navigate("/organizer/events");
      }
    } else {
      setLoading(false);
      alert("No changes detected.");
      navigate("/organizer/events");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-light">
      <main className="p-10 flex-1 overflow-y-auto"> {/* Added overflow-y-auto */}
        <h1 className="text-lg mb-7">Edit Event</h1>
        <form onSubmit={handleSubmit}>
          <input
            className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
            type="text"
            name="title"
            placeholder="Name of the Event"
            value={eventData.title}
            onChange={handleChange}
            required
          />
          <textarea
            className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
            name="description"
            placeholder="Event Description"
            value={eventData.description}
            onChange={handleChange}
            required
          />
          <input
            className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            required
          />
          <div className="flex justify-between">
            <input
              className="bg-gray-200 text-gray-900 w-[48%] rounded px-3 h-[37px] text-xs mb-6"
              type="time"
              name="start_time"
              value={eventData.start_time}
              onChange={handleChange}
              required
            />
            <input
              className="bg-gray-200 text-gray-900 w-[48%] rounded px-3 h-[37px] text-xs mb-6"
              type="time"
              name="end_time"
              value={eventData.end_time}
              onChange={handleChange}
              required
            />
          </div>

          <input
            className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
            type="text"
            name="location"
            placeholder="Location (e.g., Kakkanad, Kochi, Kerala, India)"
            value={eventData.location}
            onChange={handleChange}
          />
          {locationDebug && <p className="text-xs text-gray-400 mb-6">{locationDebug}</p>}

          <input
            className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
            type="number"
            name="max_participants"
            placeholder="Max No. of Participants"
            value={eventData.max_participants}
            onChange={handleChange}
            required
          />
          <input
            className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
            type="number"
            name="reward_points"
            placeholder="Allotted Reward Points"
            value={eventData.reward_points}
            onChange={handleChange}
            required
          />

          <input type="file" className="mb-6" onChange={handleFileChange} />
          <button
            type="button"
            className="bg-blue-500 px-4 py-2 rounded text-white mb-6"
            onClick={handleUpload}
          >
            Upload Image
          </button>
          {uploadStatus && <p className="mb-6">{uploadStatus}</p>}
          {eventData.images && (
            <img
              src={eventData.images}
              alt="Current Event"
              className="mt-4 w-full max-w-xs rounded-md mb-6"
            />
          )}

          <div className="flex items-center py-5 mb-6">
            <input className="mr-2" type="checkbox" required />
            <span className="text-xs">I agree to Terms & Conditions</span>
          </div>

          <button
            className="bg-green-400 text-gray-900 w-full h-[37px] text-xs rounded mb-6"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Event"}
          </button>
        </form>
      </main>
      <OrganizerFooter />
    </div>
  );
}

export default EditEvent;