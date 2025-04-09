import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { auth } from "../firebase/firebaseConfig";
import axiosInstance from "../utils/axiosInstance";


const PaymentScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // console.log("Event is ", event);

  const handleSubmitPayment = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Please login to make payment")
      }

      if (!utrNumber.trim()) {
        throw new Error("UTR number is required");
      }

      const paymentData = {
        userId: currentUser.uid,
        eventId: event.id,
        utrNumber,
        amount: event.fee,
        status: "Pending",
      };

      await axiosInstance.post("/payments/record", paymentData);
      navigation.goBack();
      alert("Payment recorded sucessfully!");
    } catch (err) {
      console.log("Error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Header title={"Payment"} navigation={navigation} />
      <View style={styles.content}>
        {event.paymentScannerImage ? (
          <Image source={{ uri: event.paymentScannerImage }} style={styles.scannerImage} />
          // <Text>Image exists</Text>
        ) : (
          <Text style={styles.noImage}>No pyament scanner Image is available</Text>
        )}
        <Text style={styles.fee}>Amount to Pay: ${event.fee}</Text>
        <Input
          style={styles.input}
          label={"UTR Number"}
          placeholder="Enter UTR Number"
          onChangeText={setUtrNumber}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={"Submit Payment"} onPress={handleSubmitPayment} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, alignItems: "center" },
  scannerImage: { width: 200, height: 200, marginBottom: 20 },
  noImage: { fontSize: 16, color: "#666", marginBottom: 20 },
  fee: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 20 },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginBottom: 10,
    fontSize: 16,
  },
  error: { color: "red", marginBottom: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default PaymentScreen;
