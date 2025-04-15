import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from './config/supabaseClient';

const UserProfile = () => {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    contact_number: '',
    profilePicture: 'https://via.placeholder.com/150',
    app_visits: 0
  });
  const [feedback, setFeedback] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempContact, setTempContact] = useState('');

  useEffect(() => {
    fetchUserProfile();
    incrementAppVisits();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Error getting user:', authError);
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (profileError && !profileData) {
        // Create profile if doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: authUser.id,
            name: authUser.email?.split('@')[0] || 'User',
            app_visits: 1
          }]);
        
        if (insertError) throw insertError;
        
        // Fetch again after creation
        fetchUserProfile();
        return;
      }

      setUser({
        id: authUser.id,
        name: profileData?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        contact_number: profileData?.contact_number || '',
        profilePicture: 'https://via.placeholder.com/150',
        app_visits: profileData?.app_visits || 0
      });
      setTempName(profileData?.name || authUser.email?.split('@')[0] || 'User');
      setTempContact(profileData?.contact_number || '');

    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const incrementAppVisits = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Error getting user:', authError);
        return;
      }

      const { error } = await supabase.rpc('increment_app_visits', {
        user_id: authUser.id
      });

      if (error) throw error;

    } catch (error) {
      console.error('Error incrementing app visits:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Error getting user:', authError);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: tempName,
          contact_number: tempContact
        })
        .eq('user_id', authUser.id);

      if (error) throw error;

      setUser(prev => ({
        ...prev,
        name: tempName,
        contact_number: tempContact
      }));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Error getting user:', authError);
        return;
      }

      const { error } = await supabase
        .from('feedback')
        .insert([{
          user_id: authUser.id,
          content: feedback,
          email: authUser.email
        }]);

      if (error) throw error;

      setFeedback('');
      Alert.alert('Success', 'Feedback submitted successfully');

    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
        
        {isEditing ? (
          <>
            <TextInput
              style={styles.editInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
            />
            <TextInput
              style={styles.editInput}
              value={tempContact}
              onChangeText={setTempContact}
              placeholder="Enter your contact number"
              keyboardType="phone-pad"
            />
          </>
        ) : (
          <>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.contact_number && <Text style={styles.userContact}>Contact: {user.contact_number}</Text>}
          </>
        )}

        <TouchableOpacity 
          style={styles.editButton} 
          onPress={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => {
              setIsEditing(false);
              setTempName(user.name);
              setTempContact(user.contact_number);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Usage Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Usage</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>App Visits: {user.app_visits + 1}</Text>
        </View>
      </View>

      {/* Feedback Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback</Text>
        <TextInput
          style={styles.feedbackInput}
          placeholder="Share your feedback..."
          multiline
          value={feedback}
          onChangeText={setFeedback}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userContact: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  editInput: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editButton: {
    backgroundColor: '#4A1F73',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dataContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    height: 100,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#4A1F73',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserProfile;