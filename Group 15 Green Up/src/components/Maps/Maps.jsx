import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../../services/supabaseClient.jsx";

// Default Green Marker Icon
const greenMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Blue Marker Icon for Highlighted Events
const blueMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Recenter Map Component
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 13, { animate: true });
    }
  }, [location, map]);
  return null;
};

const Maps = ({ eventLocations, highlightedIds }) => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState({});

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.error("Error retrieving location:", error)
    );
  }, []);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const userId = user.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("registrations")
        .select("event_id, id")
        .eq("user_id", userId);

      if (!error && data) {
        const registrations = {};
        data.forEach((reg) => {
          registrations[reg.event_id] = reg.id;
        });
        setRegisteredEvents(registrations);
      }
    };

    fetchRegisteredEvents();
  }, []);

  // Handle marker click
  const handleMarkerClick = (eventId) => {
    if (registeredEvents[eventId]) {
      navigate(`/afterregistration/${eventId}/${registeredEvents[eventId]}`);
    } else {
      navigate(`/registerevent/${eventId}`);
    }
  };

  return (
    <div className="map-container" style={{ width: "70vw", height: "70vh" }}>
      <MapContainer center={userLocation || [40.7128, -74.006]} zoom={13} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {userLocation && (
          <>
            <RecenterMap location={userLocation} />
            <Marker position={userLocation} icon={greenMarkerIcon}>
              <Popup>You are here!</Popup>
            </Marker>
          </>
        )}

        {eventLocations.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={highlightedIds.includes(event.id) ? blueMarkerIcon : greenMarkerIcon}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <strong>{event.title}</strong>
              <br />
              {event.description}
            </Tooltip>
            <Popup>
              <strong>{event.title}</strong> <br />
              {event.description} <br />
              <button
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                onClick={() => handleMarkerClick(event.id)}
              >
                View Event
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Maps;
