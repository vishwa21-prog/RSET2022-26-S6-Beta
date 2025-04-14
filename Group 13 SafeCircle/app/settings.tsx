import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from './config/supabaseClient';

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  
  // State for SOS Settings
  const [emergencyContacts, setEmergencyContacts] = useState(['', '']);
  const [favoriteContact, setFavoriteContact] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [contactsPermission, setContactsPermission] = useState(false);
  const [callPermission, setCallPermission] = useState(false);

  // State for Fake Call Settings
  const [fakeCallName, setFakeCallName] = useState('');
  const [fakeCallNumber, setFakeCallNumber] = useState('');
  const [fakeCallDelay, setFakeCallDelay] = useState('');

  // State for Smartwatch Pairing
  const [deviceName, setDeviceName] = useState('');
  const [deviceID, setDeviceID] = useState('');
  const [hapticAlertsPermission, setHapticAlertsPermission] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        return;
      }
      setUserId(user?.id || null);

      if (user?.id) {
        fetchSettings(user.id);
      }
    };
    fetchUserData();
  }, []);

  const fetchSettings = async (userId: string) => {
    try {
      const { data: sosData } = await supabase.from('sos_settings').select('*').eq('user_id', userId).single();
      const { data: fakeCallData } = await supabase.from('fake_call_settings').select('*').eq('user_id', userId).single();
      const { data: smartwatchData } = await supabase.from('smartwatch_settings').select('*').eq('user_id', userId).single();

      if (sosData) {
        setEmergencyContacts(sosData.emergency_contacts || ['', '']);
        setFavoriteContact(sosData.favorite_contact || '');
        setLocationPermission(sosData.location_permission || false);
        setContactsPermission(sosData.contacts_permission || false);
        setCallPermission(sosData.call_permission || false);
      }
      if (fakeCallData) {
        setFakeCallName(fakeCallData.fake_call_name || '');
        setFakeCallNumber(fakeCallData.fake_call_number || '');
        setFakeCallDelay(fakeCallData.fake_call_delay || '');
      }
      if (smartwatchData) {
        setDeviceName(smartwatchData.device_name || '');
        setDeviceID(smartwatchData.device_id || '');
        setHapticAlertsPermission(smartwatchData.haptic_alerts_permission || false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (table: string, data: object) => {
    if (!userId) return;
    try {
      await supabase.from(table).upsert({ user_id: userId, ...data });
      Alert.alert('Success', 'Settings updated successfully.');
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings.');
    }
  };

  const toggleFavorite = (contact: string) => {
    setFavoriteContact(favoriteContact === contact ? '' : contact);
  };

  return (
    <ScrollView style={styles.container}>
      {/* SOS Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>SOS Settings</Text>
        
        {emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactRow}>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={(text) => {
                const newContacts = [...emergencyContacts];
                newContacts[index] = text;
                setEmergencyContacts(newContacts);
              }}
              placeholder={`Emergency Contact ${index + 1}`}
              keyboardType="phone-pad"
            />
            <TouchableOpacity onPress={() => toggleFavorite(contact)}>
              <MaterialIcons
                name={favoriteContact === contact ? "favorite" : "favorite-border"}
                size={24}
                color={favoriteContact === contact ? "#FF3B30" : "#CCCCCC"}
              />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Location Permission</Text>
          <Switch
            value={locationPermission}
            onValueChange={setLocationPermission}
            trackColor={{ false: "#767577", true: "#4A1F73" }}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Contacts Permission</Text>
          <Switch
            value={contactsPermission}
            onValueChange={setContactsPermission}
            trackColor={{ false: "#767577", true: "#4A1F73" }}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Call Permission</Text>
          <Switch
            value={callPermission}
            onValueChange={setCallPermission}
            trackColor={{ false: "#767577", true: "#4A1F73" }}
          />
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => updateSettings('sos_settings', {
            emergency_contact_1: emergencyContacts[0],
            emergency_contact_2: emergencyContacts[1],
            favorite_contact: favoriteContact,
            location_permission: locationPermission,
            contacts_permission: contactsPermission,
            call_permission: callPermission
          })}
        >
          <Text style={styles.buttonText}>Update SOS Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Rest of your existing code for Fake Call and Smartwatch settings remains unchanged */}
      {/* Fake Call Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Fake Call Settings</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Fake Call Name" 
          value={fakeCallName} 
          onChangeText={setFakeCallName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Fake Call Number" 
          value={fakeCallNumber} 
          onChangeText={setFakeCallNumber} 
          keyboardType="phone-pad"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Call Delay (seconds)" 
          value={fakeCallDelay} 
          onChangeText={setFakeCallDelay} 
          keyboardType="numeric"
        />
        <TouchableOpacity 
          style={styles.updateButton} 
          onPress={() => updateSettings('fake_call_settings', {
            fake_call_name: fakeCallName,
            fake_call_number: fakeCallNumber,
            fake_call_delay: fakeCallDelay
          })}
        >
          <Text style={styles.buttonText}>Update Fake Call Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Smartwatch Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Smartwatch Settings</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Device Name" 
          value={deviceName} 
          onChangeText={setDeviceName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Device ID" 
          value={deviceID} 
          onChangeText={setDeviceID} 
        />
        <Switch 
          value={hapticAlertsPermission} 
          onValueChange={setHapticAlertsPermission} 
          trackColor={{ false: '#767577', true: '#4A1F73' }}
        />
        <TouchableOpacity 
          style={styles.updateButton} 
          onPress={() => updateSettings('smartwatch_settings', {
            device_name: deviceName,
            device_id: deviceID,
            haptic_alerts_permission: hapticAlertsPermission
          })}
        >
          <Text style={styles.buttonText}>Update Smartwatch Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6E6FA', padding: 20 },
  section: { 
    marginBottom: 30, 
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionHeading: { fontSize: 20, fontWeight: 'bold', color: '#4A1F73', marginBottom: 15 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: { 
    flex: 1,
    width: '100%', 
    padding: 10, 
    marginVertical: 8, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#7E5A9B', 
    backgroundColor: '#EDE4F3' 
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#4A1F73',
  },
  updateButton: { 
    backgroundColor: '#4A1F73', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' }
});