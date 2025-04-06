import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import { auth } from "../firebase/firebaseConfig";
import Loader from "../components/Loader";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      setMessage("Password rest email sent! Check your inbox.");
      setError("");
    } catch (err) {
      setError(err.message);
      setMessage("");
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
      <Text style={styles.title}>Reset Your Password</Text>
      <Text style={styles.subtitle}>Enter your registered email addresss to receive password reset instructions.</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      <Input
        placeholder={"Enter email address"}
        icon={"email"}
        value={email}
        onChangeText={setEmail}
      />
      <Button title={"Send Reset Link"} onPress={handleResetPassword} />
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.back}>Return to Login</Text>
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
  message: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  back: {
    color: '#6B48FF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;