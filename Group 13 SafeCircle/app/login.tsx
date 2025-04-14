import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from './config/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter valid credentials');
      return;
    }

    try {
      console.log('Attempting to log in...');

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          Alert.alert('User Not Found', 'No account found. Please sign up first.');
          return;
        }
        throw error;
      }

      console.log('Login Success:', data);
      Alert.alert('Success', 'Login successful! Redirecting to home...');
      router.push('/home'); // Redirect to home page
    } catch (err) {
      console.error('Login Failed:', err);
      Alert.alert('Error', err.message);
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
          <Text style={styles.loginText}>LOGIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Link href="/signup" style={styles.signupLink}>
              SIGNUP
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#a7d8de' },
  loginCard: { backgroundColor: '#E6E6FA', padding: 20, borderRadius: 25, width: 360, height: 500, alignItems: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 80, height: 80, marginBottom: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#4A1F73' },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#4A1F73' },
  formSection: { backgroundColor: '#4b1b72', borderRadius: 10, width: '100%', padding: 20, alignItems: 'center' },
  loginText: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  input: { width: '100%', padding: 10, marginVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#7E5A9B', backgroundColor: '#EDE4F3' },
  button: { width: '100%', padding: 10, backgroundColor: '#457B9D', borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  signupText: { marginTop: 10, color: '#fff' },
  signupLink: { color: '#FFD700', fontWeight: 'bold' },
});
