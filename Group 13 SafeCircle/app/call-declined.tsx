import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function CallDeclined() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity value

  // Fade out animation
  useEffect(() => {
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0, // Fade to 0 opacity
      duration: 1000, // 1 second fade duration
      delay: 4000, // Wait 4 seconds before starting the fade
      useNativeDriver: true, // Use native driver for better performance
    });

    fadeOut.start(() => {
      // Redirect to home page after fade completes
      router.push('/home');
    });

    // Cleanup on unmount
    return () => fadeOut.stop();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.message}>Call Declined</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6E6FA', // Lavender background
  },
  content: {
    alignItems: 'center',
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1F73', // Dark purple
  },
});