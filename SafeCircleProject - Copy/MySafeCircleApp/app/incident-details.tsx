import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from './config/supabaseClient';

const IncidentDetailsScreen = () => {
    const { report } = useLocalSearchParams();
    const reportData = JSON.parse(report || '{}');
    const [incidentDetails, setIncidentDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncidentDetails = async () => {
            if (!reportData.id) return;

            const { data, error } = await supabase
                .from('incident_reports')
                .select('*')
                .eq('id', reportData.id)
                .single();

            if (error) {
                console.error('Error fetching incident details:', error);
            } else {
                setIncidentDetails(data);
            }
            setLoading(false);
        };

        fetchIncidentDetails();
    }, [reportData.id]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!incidentDetails) {
        return <Text style={{ textAlign: 'center', marginTop: 20 }}>Incident not found.</Text>;
    }

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Incident Report Details</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Type: {incidentDetails.category}</Text>
            <Text>Date: {incidentDetails.date}</Text>
            <Text>Location: {incidentDetails.location}</Text>
            <Text>Severity: {incidentDetails.severity}</Text>
            <Text>Description:</Text>
            <Text>{incidentDetails.description}</Text>
        </ScrollView>
    );
};

export default IncidentDetailsScreen;