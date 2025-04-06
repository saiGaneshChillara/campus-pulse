// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import the new method
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore methods
import { uploadImageToCloudinary } from '../utils/cloudinary';
import Input from '../components/Input';
import Button from '../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { addSampleEvents } from '../scripts/sampleEvents';
import Loader from '../components/Loader';

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [collegeId, setCollegeId] = useState(null);
  const [collegeIdUrl, setCollegeIdUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setCollegeId(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Upload the college ID to Cloudinary if selected
      setLoading(true);
      let collegeIdUrl = '';
      if (collegeId) {
        collegeIdUrl = await uploadImageToCloudinary(collegeId);
        setCollegeIdUrl(collegeIdUrl);
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Store user data in Firestore
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        fullName,
        email,
        collegeId: collegeIdUrl,
      });

      // await addSampleEvents();

      navigation.replace('Main');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CP</Text>
      <Text style={styles.title}>Join Campus Pulse</Text>
      <Text style={styles.subtitle}>Connect with your campus community</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        placeholder="Enter your full name"
        icon="person"
        value={fullName}
        onChangeText={setFullName}
      />
      <Input
        placeholder="Enter college email"
        icon="email"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadText}>
          {collegeId ? 'College ID Uploaded' : 'Upload college ID card'}
        </Text>
      </TouchableOpacity>
      <Input
        placeholder="Create a password"
        icon="lock"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Input
        placeholder="Confirm your password"
        icon="lock"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.login}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#6B48FF',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  uploadText: {
    color: '#666',
  },
  login: {
    color: '#6B48FF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SignUpScreen;