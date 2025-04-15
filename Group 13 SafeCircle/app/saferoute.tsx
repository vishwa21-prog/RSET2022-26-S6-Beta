import React, { useState } from "react";
import { View, Text, TextInput, Button, Modal, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const SafeRouteScreen = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleSafeRoute = () => {
    if (!source.trim() || !destination.trim()) {
      Alert.alert("Error", "Please enter both source and destination.");
      return;
    }

    const encodedSource = encodeURIComponent(source.trim());
    const encodedDestination = encodeURIComponent(destination.trim());
    
    setModalVisible(false);
    router.push(`/MapS?source=${encodedSource}&destination=${encodedDestination}`);
  };

  return (
    <View style={styles.container}>
      {/* Button to open input modal */}
      <Button title="Enter Source & Destination" color="#4b1b72" onPress={() => setModalVisible(true)} />

      {/* Modal for entering source and destination */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Source & Destination</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter source..."
              value={source}
              onChangeText={setSource}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Enter destination..."
              value={destination}
              onChangeText={setDestination}
            />
        
            <Button title="Find Safe Route" color="#7E5A9B" onPress={handleSafeRoute} />
            <Button title="Cancel" color="#a7d8de" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "white", borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
});

export default SafeRouteScreen;
