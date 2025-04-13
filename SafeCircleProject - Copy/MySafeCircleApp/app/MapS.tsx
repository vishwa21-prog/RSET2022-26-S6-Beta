import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";

const COLORS = ["blue", "green", "red", "purple", "orange"];

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routes, setRoutes] = useState([]);

  const { source, destination } = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to use this feature.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (source && destination) {
        const srcCoords = await getCoordinates(source);
        const destCoords = await getCoordinates(destination);

        if (srcCoords && destCoords) {
          setSourceCoords(srcCoords);
          setDestinationCoords(destCoords);
          fetchRoutes(srcCoords, destCoords);
        } else {
          Alert.alert("Error", "Could not find coordinates for the given locations.");
        }
      }
    })();
  }, [source, destination]);

  // Function to get coordinates from a location name (via OpenStreetMap)
  const getCoordinates = async (placeName) => {
    try {
      const query = `${encodeURIComponent(placeName)}, Kochi, Kerala, India`;
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  
      const response = await fetch(url, {
        headers: { "User-Agent": "SafeCircleApp/1.0 (contact@yourdomain.com)" }, 
      });
  
      const data = await response.json();
  
      if (data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      } else {
        Alert.alert("Error", "Location not found in Kochi.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location.");
      console.error("Error fetching coordinates:", error);
    }
    return null;
  };
  
  
  const fetchRoutes = async (src, dest) => {
    try {
      const routeURL = `https://router.project-osrm.org/route/v1/driving/${src.longitude},${src.latitude};${dest.longitude},${dest.latitude}?alternatives=true&overview=full&geometries=geojson`;

      const response = await fetch(routeURL);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        setRoutes(data.routes);
      } else {
        Alert.alert("Error", "No routes found.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch routes.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: sourceCoords?.latitude || userLocation?.latitude || 9.9312,
          longitude: sourceCoords?.longitude || userLocation?.longitude || 76.2673,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {/* Show source and destination markers */}
        {sourceCoords && <Marker coordinate={sourceCoords} title="Source" pinColor="green" />}
        {destinationCoords && <Marker coordinate={destinationCoords} title="Destination" pinColor="red" />}

        {/* Render all available routes */}
        {routes.map((route, index) => (
          <Polyline
            key={index}
            coordinates={route.geometry.coordinates.map(([lon, lat]) => ({ latitude: lat, longitude: lon }))}
            strokeColor={COLORS[index % COLORS.length]}
            strokeWidth={4}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
});

export default MapScreen;