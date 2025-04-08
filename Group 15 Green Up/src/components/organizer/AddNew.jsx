import { useState, useRef } from "react"; // Added useRef
import { supabase } from "./../../services/supabaseClient";
import OrganizerFooter from "./OrganizerFooter";

function AddNew() {
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
        image_url: ""
    });

    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [locationDebug, setLocationDebug] = useState(""); // Debug info
    const fileInputRef = useRef(null); // Ref for the file input

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({
            ...eventData,
            [name]: value
        });

        if (name === "location") {
            setLocationDebug(`Input: ${value}`);
            fetchCoordinates(value);
        }
    };

    const fetchCoordinates = async (address) => {
        if (!address) {
            setLocationDebug("No address provided");
            return;
        }
    
        try {
            // Adding full address context to improve accuracy
            const fullAddress = `${address}, Kochi, Kerala, India`;
            const encodedAddress = encodeURIComponent(fullAddress.trim());
    
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
                {
                    headers: {
                        "User-Agent": "GreenUpApp/1.0 (contact@yourdomain.com)", // Replace with your actual email or domain
                        "Accept-Language": "en"
                    }
                }
            );
    
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
    
            const data = await response.json();
    
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setEventData((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon
                }));
                setLocationDebug(`Found: ${display_name} (Lat: ${lat}, Lon: ${lon})`);
            } else {
                setLocationDebug("No coordinates found for this address");
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            setLocationDebug(`Error fetching coordinates: ${error.message}`);
        }
    };
    

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setUploadStatus(`File selected: ${file.name}`);
            handleUpload(file); // Automatically trigger upload after file selection
        }
    };

    const handleUpload = async (file) => {
        if (!file) {
            setUploadStatus("No file selected.");
            return;
        }

        setUploadStatus("Uploading...");
        const fileName = `${Date.now()}_${file.name}`;

        const { data, error } = await supabase.storage
            .from("event_images")
            .upload(fileName, file);

        if (error) {
            setUploadStatus("Error uploading file.");
            return;
        }

        const { data: urlData } = supabase.storage
            .from("event_images")
            .getPublicUrl(fileName);

        setEventData((prev) => ({
            ...prev,
            image_url: urlData.publicUrl
        }));

        setUploadStatus("Upload successful!");
    };

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Programmatically trigger file input click
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

        const { error } = await supabase
            .from("events")
            .insert([
                {
                    title: eventData.title,
                    description: eventData.description,
                    date: eventData.date,
                    start_time: eventData.start_time,
                    end_time: eventData.end_time,
                    latitude: Number(eventData.latitude) || null,
                    longitude: Number(eventData.longitude) || null,
                    max_participants: Number(eventData.max_participants),
                    reward_points: Number(eventData.reward_points),
                    images: eventData.image_url,
                    organizer_id: organizerId,
                }
            ]);

        setLoading(false);

        if (error) {
            alert("Error adding event: " + error.message);
        } else {
            alert("Event added successfully!");
            window.location.reload(); // Refresh the page after successful registration
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-light">
            <main className="p-10 flex-1 mb-20">
                <h1 className="text-lg mb-7">Be an Organizer Now</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
                        type="text"
                        name="title"
                        placeholder="Name of the Event"
                        onChange={handleChange}
                        required
                    />
<textarea
    className="bg-gray-200 text-gray-900 w-full rounded px-3 py-[6px] text-xs mb-6 h-[37px] leading-[32px]"
    name="description"
    placeholder="Event Description"
    onChange={handleChange}
    required
/>




                    <label className="text-xs text-gray-300 block mb-1">Date</label>  {/* ✅ Added title */}
                    <input
                        className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
                        type="date"
                        name="date"
                        onChange={handleChange}
                        required
                    />
                    <div className="flex justify-between">
                    <div className="mb-6">
                            <label className="text-xs text-gray-300 block mb-1">Start Time</label>  {/* ✅ Added title */}
                            <input
                                className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs"
                                type="time"
                                name="start_time"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-xs text-gray-300 block mb-1">End Time</label>  {/* ✅ Added title */}
                            <input
                                className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs"
                                type="time"
                                name="end_time"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        </div>


                    <input
                        className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
                        type="text"
                        name="location"
                        placeholder="Location (e.g., Kakkanad, Kochi, Kerala, India)"
                        onChange={handleChange}
                        required
                    />
                    {locationDebug && <p className="text-xs text-gray-400 mb-6">{locationDebug}</p>}

                    <input
                        className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
                        type="number"
                        name="max_participants"
                        placeholder="Max No. of Participants"
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="bg-gray-200 text-gray-900 w-full rounded px-3 h-[37px] text-xs mb-6"
                        type="number"
                        name="reward_points"
                        placeholder="Allotted Reward Points"
                        onChange={handleChange}
                        required
                    />

                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {/* Combined Upload Image button */}
                    <button
                        type="button"
                        className="bg-blue-500 px-4 py-2 rounded text-white mb-4"
                        onClick={handleButtonClick}
                    >
                        Upload Image
                    </button>
                    {uploadStatus && <p className="mb-4">{uploadStatus}</p>}

                    <div className="flex items-center py-5">
                        <input className="mr-2" type="checkbox" required />
                        <span className="text-xs">I agree to Terms & Conditions</span>
                    </div>

                    <button
                        className="bg-green-400 text-gray-900 w-full h-[37px] text-xs rounded"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register Now"}
                    </button>
                </form>
            </main>
            <OrganizerFooter />
        </div>
    );
}

export default AddNew;