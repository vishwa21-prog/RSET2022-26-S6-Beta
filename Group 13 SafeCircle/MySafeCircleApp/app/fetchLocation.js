import { Alert } from "react-native";

const fetchLocationFromOSM = async (city = "Kochi") => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`
    );
    const data = await response.json();

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } else {
      Alert.alert("Error", "City not found. Using default location: Kochi.");
      return { latitude: 9.9312, longitude: 76.2673 }; // Default to Kochi
    }
  } catch (error) {
    Alert.alert("Error", "Could not fetch location. Using default location: Kochi.");
    return { latitude: 9.9312, longitude: 76.2673 }; // Default to Kochi
  }
};

export default fetchLocationFromOSM;