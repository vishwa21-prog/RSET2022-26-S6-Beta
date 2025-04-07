import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MapComponent({ setLocation }) {
  const [position, setPosition] = useState([20.5937, 78.9629]); // Default: India

  // Function to handle map clicks
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });

    return <Marker position={position} icon={customIcon} />;
  }

  // Function to fetch address from coordinates
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      const address = data.display_name || `${lat}, ${lon}`;
      setLocation(address); // Update parent component with location
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  // Function to get user's current location
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Failed to get location. Please try again.");
      }
    );
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Map Container */}
      <MapContainer center={position} zoom={5} className="w-full h-64 rounded-lg overflow-hidden shadow-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>

      {/* Use My Location Button - FIXED */}
      <button
        type="button" // ✅ Prevents accidental form submission
        onClick={useMyLocation}
        className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
      >
        Use My Location
      </button>
    </div>
  );
}
