import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "./config/supabaseClient";

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState<{ 
    latitude: number; 
    longitude: number 
  } | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission denied. Please enable location services.");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Fetch incidents from Supabase
        const { data, error } = await supabase
          .from('incident_reports')
          .select('id, category, latitude, longitude')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;
        
        setIncidents(data || []);
      } catch (error) {
        console.error("Error:", error);
        setErrorMsg("Failed to load incident data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading map data...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onPress={() => {}} // Important for callout functionality
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="This is your current location"
            pinColor="blue"
          />
        )}

        {/* Incident markers with working callouts */}
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude,
            }}
            title={incident.category}
          >
            <Callout tooltip={true} style={styles.callout}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutText}>{incident.category}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  callout: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 5,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  calloutContainer: {
    minWidth: 100,
    padding: 5,
  },
  calloutText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MapScreen;