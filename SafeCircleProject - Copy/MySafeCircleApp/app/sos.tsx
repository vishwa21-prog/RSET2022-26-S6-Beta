import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import call from 'react-native-phone-call';
import * as Location from 'expo-location';

const AndroidSOS = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Hardcoded test values (replace with real data in production)
  const emergencyContacts = ['+917594851232']; // Test number
  const favoriteContact = '+917594851232'; // Test number
  const userName = 'Test User';
  const helplineNumber = '181'; // National helpline

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required for SOS');
        return null;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        googleMapsLink: `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      };
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  };

  const triggerSOS = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. Get current location
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Error', 'Could not get current location');
        return;
      }

      // 2. Call primary contact
      await makeEmergencyCall(favoriteContact || emergencyContacts[0]);
      
      // 3. Send SMS with location to all contacts
      await sendEmergencySMS(location);
      
      Alert.alert('SOS Activated', 'Emergency contacts notified with your location!');
    } catch (error) {
      Alert.alert('Error', 'Could not complete all emergency actions');
      console.error('SOS Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const makeEmergencyCall = async (number: string) => {
    try {
      if (Platform.OS === 'android') {
        await call({
          number,
          prompt: false, // Attempt direct call
          skipCanOpen: true
        });
      }
    } catch (error) {
      // Fallback to opening dialer
      Alert.alert(
        'Call Simulation',
        `Opening dialer with ${number}\n\n` +
        'On emulator, this wont make a real call.'
      );
      Linking.openURL(`tel:${number}`);
    }
  };

  const sendEmergencySMS = async (location: {
    latitude: number;
    longitude: number;
    googleMapsLink: string;
    accuracy: number;
  }) => {
    const numbers = [...emergencyContacts, helplineNumber];
    const message = `🚨 EMERGENCY from ${userName}!
I need immediate help!
📍 Location: ${location.googleMapsLink}
(Accuracy: ${Math.round(location.accuracy)} meters)`;

    if (Platform.OS === 'android') {
      try {
        // First try using expo-sms (needs permissions)
        const { result } = await SMS.sendSMSAsync(numbers, message);
        if (result !== 'sent') throw new Error('SMS not sent');
      } catch (error) {
        // Fallback to SMS intent
        Linking.openURL(
          `sms:${numbers.join(',')}?body=${encodeURIComponent(message)}`
        );
        Alert.alert(
          'SMS Simulation',
          'SMS app opened with location details.\n\n' +
          'On emulator, this wont actually send.'
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.sosButton, isLoading && styles.buttonDisabled]}
        onPress={triggerSOS}
        disabled={isLoading}
      >
        <MaterialIcons name="warning" size={24} color="white" />
        <Text style={styles.buttonText}>
          {isLoading ? 'ACTIVATING SOS...' : 'SOS EMERGENCY'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.infoText}>
        {emergencyContacts.length > 0 
          ? `Will notify ${emergencyContacts.length} contact(s) with your location`
          : 'No emergency contacts set'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  infoText: {
    marginTop: 15,
    color: '#666',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default AndroidSOS;