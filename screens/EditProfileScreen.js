import * as ImagePicker from 'expo-image-picker';
import { reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";
import { uploadImageToCloudinary } from "../utils/cloudinary";

const EditProfileScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [collegeId, setCollegeId] = useState(null);
  const [collegeIdUrl, setCollegeIdUrl] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [yearsOfStudy, setYearsOfStudy] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setError('No user is logged in');
          return;
        }
        const uid = user.uid;

        const userDoc = await getDoc(doc(firestore, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFullName(userData.fullName || '');
          setCollegeIdUrl(userData.collegeId || '');
          setCollegeName(userData.collegeName || '');
          setYearsOfStudy(userData.yearsOfStudy || '');

        } else {
          setError('User data not found');
        }
      } catch (err) {
        setError('Error in fetching userData' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]);

  const pickCollegeId = async () => {
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

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError('User not logged in');
        return;
      }
      const uid = user.uid;

      if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
          setError('Please enter your current password');
          setLoading(false);
          return;
        }
        if (newPassword != confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        await updatePassword(user, newPassword);
      }

      let newCollegeIdUrl = collegeIdUrl;
      if (collegeId) {
        newCollegeIdUrl = await uploadImageToCloudinary(collegeId);
        setCollegeIdUrl(newCollegeIdUrl);
      }

      await updateDoc(doc(firestore, 'users', uid), {
        fullName,
        collegeId: newCollegeIdUrl,
        collegeName,
        yearsOfStudy,
      });

      navigation.navigate('Main', { screen: 'Profile' });

    } catch (err) {
      setError('Error in updating profile' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CP</Text>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.subtitle}>Update your campus profile</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {/* <Input
        placeholder={'Enter your full name'}
        icon={'person'}
        value={fullName}
        onChangeText={setFullName}
      /> */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter full name'
          value={fullName}
          onChangeText={setFullName}
        />
      </View>
      {/* <Input
        placeholder={'Enter your college name'}
        // icon={'person
        value={collegeName}
        onChangeText={setCollegeName}
      /> */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>College Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your college name"
          value={collegeName}
          onChangeText={setCollegeName}
        />
      </View>
      {/* <Input
        placeholder={'Enter your year of study'}
        // icon={'person'}
        value={yearsOfStudy}
        onChangeText={setYearsOfStudy}
      /> */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Year of Study</Text>
        <TextInput 
          style={styles.input}
          placeholder='Enter year of study'
          value={yearsOfStudy}
          onChangeText={setYearsOfStudy}
        />
      </View>
      <TouchableOpacity style={styles.uploadButton} onPress={pickCollegeId}>
        <Text style={styles.uploadText}>
          {collegeId || collegeIdUrl ? 'Profile uploaded' : 'Upload Profile'}
        </Text>
      </TouchableOpacity>
      <Input
        placeholder={'Enter current password'}
        icon={'lock'}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <Input
        placeholder={'Enter new Password'}
        icon={'lock'}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Input
        placeholder={'Confirm new Password'}
        icon={'lock'}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title={'Save Changes'} onPress={handleSaveProfile} />
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
  back: {
    color: '#6b48ff',
    textAlign: 'center',
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    marginVertical: 10,
  }
});

export default EditProfileScreen;