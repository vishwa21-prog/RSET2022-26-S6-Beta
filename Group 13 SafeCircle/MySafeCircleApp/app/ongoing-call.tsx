import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { supabase } from './config/supabaseClient';

export default function OngoingCall() {
  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [callDetails, setCallDetails] = useState({
    name: 'Unknown',
    number: 'Unknown'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch fake call settings from backend
  const fetchCallSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw authError || new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('fake_call_settings')
        .select('fake_call_name, fake_call_number')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setCallDetails({
          name: data.fake_call_name || 'Unknown',
          number: data.fake_call_number || 'Unknown'
        });
      }

    } catch (error) {
      console.error('Error fetching call settings:', error);
      Alert.alert('Error', 'Failed to load call settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Load and play the pre-recorded audio
  const playAudio = async () => {
    try {
      await fetchCallSettings();
      
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/fake_convo.mp3') // Replace with your audio file
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play call audio');
    }
  };

  // Stop the audio and end the call
  const endCall = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      router.push('/terminated-call');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  // Play audio when the component mounts
  useEffect(() => {
    playAudio();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading call details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.callText}>Ongoing Fake Call</Text>
      <Text style={styles.callerName}>{callDetails.name}</Text>
      <Text style={styles.callerNumber}>{callDetails.number}</Text>

      {/* End Call Button */}
      <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
        <Text style={styles.endCallButtonText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
  },
  loadingText: {
    fontSize: 18,
    color: '#4A1F73',
  },
  callText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1F73',
    marginBottom: 20,
  },
  callerName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4A1F73',
    marginBottom: 10,
  },
  callerNumber: {
    fontSize: 18,
    color: '#4A1F73',
    marginBottom: 30,
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  endCallButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});