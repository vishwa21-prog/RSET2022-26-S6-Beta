import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Animated, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { supabase } from "./config/supabaseClient";

export default function HomePage() {
  const router = useRouter();

  // State for incident reports fetched from Supabase
  const [incidentReports, setIncidentReports] = useState([]);
  const [helpAlerts, setHelpAlerts] = useState([
    { id: 1, name: 'AnonymousUser', location: 'Fort Kochi', timestamp: new Date().getTime() - 3600000 },
  ]);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const [alarmMessage, setAlarmMessage] = useState('');
  const [isFakeCallScheduled, setIsFakeCallScheduled] = useState(false);
  const soundRef = useRef(null);
  const timeoutRef = useRef(null);

  // Pulsating animation for SOS button
  const pulseAnim = new Animated.Value(1);
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])
  ).start();

  // Fetch incident reports from Supabase
  const fetchIncidentReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("Fetched incidents:", data); // Debug log
      setIncidentReports(data || []);
    } catch (error) {
      console.error('Error fetching incident reports:', error.message);
      Alert.alert('Error', 'Failed to fetch incident reports');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get background color based on severity
  const getSeverityColor = (severity) => {
    if (!severity) return '#EDE4F3'; // Default if severity is missing
    
    // Convert to lowercase for case-insensitive comparison
    const severityLower = severity.toLowerCase().trim();
    
    console.log(`Severity value: ${severityLower}`); // Debug log
    
    switch (severityLower) {
      case 'severe':
        return '#FFCCCB'; // Light red
      case 'moderate':
        return '#FFF3CD'; // Light yellow
      case 'safe':
        return '#D4EDDA'; // Light green
      default:
        return '#EDE4F3'; // Default lavender
    }
  };

  // Load the sound file
  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/alarm.wav')
    );
    soundRef.current = sound;
  };

  const playAlarm = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setAlarmMessage('Panic Alarm has been triggered!');
      setIsAlarmOn(true);
      timeoutRef.current = setTimeout(() => {
        stopAlarm();
      }, 120000);
    }
  };

  const stopAlarm = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setAlarmMessage('');
      setIsAlarmOn(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handlePanicAlarm = () => {
    if (isAlarmOn) {
      stopAlarm();
    } else {
      playAlarm();
    }
  };

  useEffect(() => {
    loadSound();
    fetchIncidentReports();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSOS = () => {
    Alert.alert('SOS Activated');
    router.push("/sos");
  };

  const handleFakeCall = () => {
    Alert.alert('Fake Call', 'A fake call will be initiated in 10 seconds.');
    setIsFakeCallScheduled(true);
    setTimeout(() => {
      setIsFakeCallScheduled(false);
      router.push('/incoming-call');
    }, 10000);
  };

  const handleSafeRoute = () => {
    Alert.alert("Safe Route", "AI-based safe route suggestion activated.");
    router.push("/saferoute");
  };

  const handleViewMore = () => {
    router.push('/map');
  };

  const handleViewDetails = (report) => {
    router.push({ pathname: '/incident-details', params: { report: JSON.stringify(report) } });
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  // Sort incident reports by date or severity
  const sortedIncidentReports = [...incidentReports].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'severity') {
      const severityOrder = { severe: 1, moderate: 2, safe: 3 };
      return severityOrder[a.severity?.toLowerCase()] - severityOrder[b.severity?.toLowerCase()];
    }
    return 0;
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString()}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A1F73" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={toggleMenu}>
          <MaterialIcons name="menu" size={24} color="#4A1F73" />
        </TouchableOpacity>
      </View>

      {/* Hamburger Menu */}
      {isMenuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <MaterialIcons name="settings" size={20} color="#4A1F73" />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile')}>
            <MaterialIcons name="person" size={20} color="#4A1F73" />
            <Text style={styles.menuText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/login')}>
            <MaterialIcons name="logout" size={20} color="#4A1F73" />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://www.google.com')}
          >
            <MaterialIcons name="google" size={20} color="#4A1F73" />
            <Text style={styles.menuText}>   Google</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SOS Button with Pulsating Animation */}
      <Animated.View style={[styles.sosButton, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity onPress={handleSOS}>
          <Text style={styles.sosButtonText}>SOS</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Buttons in Grid Layout */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePanicAlarm}>
          <MaterialIcons name="warning" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>
            {isAlarmOn ? 'Turn Off Alarm' : 'Panic Alarm'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleFakeCall}>
          <MaterialIcons name="call" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Fake Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSafeRoute}>
          <MaterialIcons name="directions" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Safe Route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/report-incident')}>
          <MaterialIcons name="report" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Report Incident</Text>
        </TouchableOpacity>
      </View>

      {/* Panic Alarm Message */}
      {alarmMessage && <Text style={styles.alarmMessage}>{alarmMessage}</Text>}

      {/* Fake Call Scheduled Message */}
      {isFakeCallScheduled && (
        <Text style={styles.fakeCallMessage}>Fake call is scheduled in 10 seconds...</Text>
      )}

      {/* Incident Reports Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Incident Reports</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortBy(sortBy === 'date' ? 'severity' : 'date')}
        >
          <Text style={styles.sortButtonText}>Sort by: {sortBy === 'date' ? 'Date' : 'Severity'}</Text>
        </TouchableOpacity>
      </View>

      {/* Nested ScrollView for Incident Reports */}
      <ScrollView style={styles.verticalScroll} nestedScrollEnabled={true}>
        <View style={styles.incidentReportsContainer}>
          {sortedIncidentReports.length > 0 ? (
            sortedIncidentReports.map((report) => (
              <View
                key={report.id}
                style={[
                  styles.incidentCard,
                  { backgroundColor: getSeverityColor(report.severity) }
                ]}
              >
                <View style={styles.incidentContent}>
                  <Text style={styles.incidentTitle}>{report.category}</Text>
                  <Text style={styles.incidentDescription}>{report.location}</Text>
                  <Text style={styles.incidentDate}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => handleViewDetails(report)}>
                    <MaterialIcons name="text-fields" size={24} color="#4A1F73" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noReportsText}>No incident reports available</Text>
          )}
        </View>
      </ScrollView>

      {/* View More Button */}
      <TouchableOpacity style={styles.viewMoreButton} onPress={handleViewMore}>
        <Text style={styles.viewMoreButtonText}>View More on Map →</Text>
      </TouchableOpacity>

      {/* Nearby User Alerts Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Nearby User Alerts</Text>
      </View>
      <ScrollView horizontal style={styles.horizontalScroll}>
        {helpAlerts.length === 0 ? (
          <Text style={styles.noAlertsText}>No nearby user alerts available.</Text>
        ) : (
          <View style={styles.helpAlertsContainer}>
            {helpAlerts.map((alert) => (
              <View key={alert.id} style={styles.helpAlertCard}>
                <View style={styles.helpAlertContent}>
                  <Text style={styles.helpAlertName}>{alert.name}</Text>
                  <Text style={styles.helpAlertLocation}>{alert.location}</Text>
                  <Text style={styles.helpAlertTime}>{formatTime(alert.timestamp)}</Text>
                </View>
                <Animated.View style={[styles.helpAlertIndicator, { opacity: pulseAnim }]} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
}

// ... (keep the same styles object as in your original code)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6FA',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  menu: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuText: {
    color: '#4A1F73',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sosButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#4A1F73',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 5,
  },
  alarmMessage: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A1F73',
  },
  fakeCallMessage: {
    fontSize: 16,
    color: '#4A1F73',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  sortButton: {
    backgroundColor: '#4A1F73',
    padding: 10,
    borderRadius: 10,
  },
  sortButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  horizontalScroll: {
    marginBottom: 20,
  },
  verticalScroll: {
    maxHeight: 300,
    width: '100%',
  },
  incidentReportsContainer: {
    width: '100%',
  },
  incidentCard: {
    backgroundColor: '#EDE4F3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  incidentContent: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4A1F73',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#4A1F73',
  },
  incidentDate: {
    fontSize: 12,
    color: '#4A1F73',
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 250,
    gap: 10,
  },
  noReportsText: {
    fontSize: 16,
    color: '#4A1F73',
    textAlign: 'center',
    marginTop: 20,
  },
  helpAlertsContainer: {
    flexDirection: 'row',
  },
  helpAlertCard: {
    backgroundColor: '#EDE4F3',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    width: 200,
  },
  helpAlertContent: {
    flex: 1,
  },
  helpAlertName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A1F73',
  },
  helpAlertLocation: {
    fontSize: 14,
    color: '#4A1F73',
  },
  helpAlertTime: {
    fontSize: 12,
    color: '#4A1F73',
    marginTop: 5,
  },
  helpAlertIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  noAlertsText: {
    fontSize: 16,
    color: '#4A1F73',
    textAlign: 'center',
    marginTop: 20,
  },
  viewMoreButton: {
    backgroundColor: '#4A1F73',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  viewMoreButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});