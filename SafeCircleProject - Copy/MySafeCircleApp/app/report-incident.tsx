import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from './config/supabaseClient';

const ReportIncidentForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    description: '',
    date: new Date(),
    severity: 'moderate'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Harassment', 'Theft', 'Assault', 'Suspicious Activity', 'Vandalism', 'Other'];

  const handleLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get coordinates.');
        return;
      }

      const geocodedLocation = await Location.geocodeAsync(formData.location);
      if (geocodedLocation.length > 0) {
        setFormData({
          ...formData,
          latitude: geocodedLocation[0].latitude,
          longitude: geocodedLocation[0].longitude
        });
        Alert.alert('Location Found', `Latitude: ${geocodedLocation[0].latitude}, Longitude: ${geocodedLocation[0].longitude}`);
      } else {
        Alert.alert('Error', 'Location not found. Please enter a valid address.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve location.');
      console.error('Location Error:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      const { category, location, description, date, severity } = formData;
      if (!category || !location || !description || !date || !severity) {
        Alert.alert('Error', 'Please fill out all required fields.');
        return;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Error', 'You must be logged in to submit a report.');
        return;
      }

      // Submit to Supabase
      const { error } = await supabase.from('incident_reports').insert([{
        user_id: user.id,
        category,
        location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description,
        date: date.toISOString(),
        severity,
        created_at: new Date().toISOString()
      }]);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Incident reported successfully!');
      router.push('/home');
    } catch (error) {
      console.error('Submission Error:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Report an Incident</Text>

      {/* Category Picker */}
      <Text style={styles.label}>Category*</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.category}
          onValueChange={(itemValue) => setFormData({...formData, category: itemValue})}
          testID="category-picker"
        >
          <Picker.Item label="Select a category" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      {/* Location Input */}
      <Text style={styles.label}>Location*</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter location address"
        value={formData.location}
        onChangeText={(text) => setFormData({...formData, location: text})}
        testID="location-input"
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLocation}
        testID="get-coordinates-button"
      >
        <Text style={styles.buttonText}>Get Coordinates</Text>
      </TouchableOpacity>

      {/* Description Input */}
      <Text style={styles.label}>Description*</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Describe what happened"
        value={formData.description}
        onChangeText={(text) => setFormData({...formData, description: text})}
        multiline
        numberOfLines={4}
        testID="description-input"
      />

      {/* Date Picker */}
      <Text style={styles.label}>Date & Time*</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowDatePicker(true)}
        testID="date-picker-button"
      >
        <Text style={styles.buttonText}>
          {formData.date.toLocaleString()}
        </Text>
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          testID="date-time-picker"
        />
      )}

      {/* Severity Picker */}
      <Text style={styles.label}>Severity*</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.severity}
          onValueChange={(itemValue) => setFormData({...formData, severity: itemValue})}
          testID="severity-picker"
        >
          <Picker.Item label="Severe" value="severe" />
          <Picker.Item label="Moderate" value="moderate" />
          <Picker.Item label="Safe" value="safe" />
        </Picker>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, styles.submitButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        testID="submit-button"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6FA',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1F73',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A1F73',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#4A1F73',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#3A0D6B',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReportIncidentForm;