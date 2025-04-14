import React from "react";
import { View } from "react-native";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapScreenWeb() {
  return (
    <View style={{ width: "100vw", height: "100vh" }}>
      <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </View>
  );
}