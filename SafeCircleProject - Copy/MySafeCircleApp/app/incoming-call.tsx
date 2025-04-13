import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { supabase } from './config/supabaseClient';

const IncomingCall: React.FC = () => {
  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [callDetails, setCallDetails] = useState({
    name: 'Unknown',
    number: 'Unknown',
    delay: 5 // Default delay of 5 seconds
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCall, setShowCall] = useState(false);

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
        .select('fake_call_name, fake_call_number, fake_call_delay')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setCallDetails({
          name: data.fake_call_name || 'Unknown',
          number: data.fake_call_number || 'Unknown',
          delay: data.fake_call_delay || 5
        });
      }

    } catch (error) {
      console.error('Error fetching call settings:', error);
      Alert.alert('Error', 'Failed to load call settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Play ringtone with delay
  const playRingtone = async () => {
    try {
      await fetchCallSettings();
      
      // Wait for the specified delay before showing the call
      setTimeout(async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/ringtone.wav') // Replace with your ringtone file
        );
        soundRef.current = sound;
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
        setShowCall(true);
      }, (callDetails.delay || 5) * 1000);

    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  };

  // Stop the ringtone
  const stopRingtone = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  // Handle call answer
  const handleAnswerCall = () => {
    stopRingtone();
    Alert.alert('Call Answered', 'You answered the fake call.');
    router.push('/ongoing-call');
  };

  // Handle call decline
  const handleDeclineCall = () => {
    stopRingtone();
    Alert.alert('Call Declined', 'You declined the fake call.');
    router.push('/call-declined');
  };

  // Play ringtone when the component mounts
  useEffect(() => {
    playRingtone();

    // Cleanup on unmount
    return () => {
      stopRingtone();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading call settings...</Text>
      </View>
    );
  }

  if (!showCall) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          Fake call will appear in {callDetails.delay} seconds...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.callText}>Incoming Fake Call</Text>
      <Text style={styles.callerName}>{callDetails.name}</Text>
      <Text style={styles.callerNumber}>{callDetails.number}</Text>

      {/* Call Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.declineButton]} 
          onPress={handleDeclineCall}
        >
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.answerButton]} 
          onPress={handleAnswerCall}
        >
          <Text style={styles.buttonText}>Answer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  answerButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default IncomingCall;