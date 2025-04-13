import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/logo.png")} style={styles.logo} />
      <Text style={styles.text}>SafeCircle</Text>

      {/* Explore Button */}
      <Pressable style={styles.exploreButton} onPress={() => router.push("/login")}>
        <Text style={styles.exploreText}>Explore</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6E6FA", // Lavender
    paddingBottom: 50, // Pushes button down slightly
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A1F73",
    marginBottom: 20,
  },
  exploreButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#4A1F73", // Dark purple
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
});