import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from './config/supabaseClient'; // Import Supabase instance

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    try {
      console.log("Signing up user...");
      const { data, error } = await supabase.auth.signUp({ email, password });
  
      if (error) {
        console.error("Auth Signup Error:", error);
        throw new Error(error.message);
      }
  
      console.log("Signup Success:", data);
  
      Alert.alert('Success', 'Signup successful! Check your email to verify your account.');
      router.push('/login');
    } catch (err) {
      console.error("Signup Failed:", err);
      Alert.alert('Signup Failed', err.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.loginCard}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.appName}>SafeCircle</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.loginText}>SIGN UP</Text>
          <TextInput
            style={styles.input}
            placeholder="Email/Phone"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>
          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Link href="/login" style={styles.signupLink}>
              LOGIN
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a7d8de', // Light blue background
  },
  loginCard: {
    backgroundColor: '#E6E6FA', // Lavender background
    padding: 20,
    borderRadius: 25,
    width: 360,
    height: 550,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A1F73', // Dark purple
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1F73', // Dark purple
  },
  formSection: {
    backgroundColor: '#4b1b72', // Dark purple
    borderRadius: 10,
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff', // White
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7E5A9B', // Light purple
    backgroundColor: '#EDE4F3', // Light lavender
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: '#457B9D', // Blue
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff', // White
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 10,
    color: '#fff', // White
  },
  signupLink: {
    color: '#FFD700', // Gold
    fontWeight: 'bold',
  },
});