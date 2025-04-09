import { MaterialIcons } from '@expo/vector-icons';
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { auth, firestore } from "../firebase/firebaseConfig";
import Loader from '../components/Loader';
import axiosInstance from '../utils/axiosInstance';

const EventRegistrationScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [yearsOfStudy, setYearsOfStudy] = useState("");
  const [loading, setLoading] = useState(false);

  const checkPaymentStatus = async () => {
    const curentUser = auth.currentUser;
    if (!curentUser) return false;

    const response = await axiosInstance.get(`/payments/check/${curentUser.uid}/${event.id}`);
    return response.data.hasPayment;
  };



  const handleRegister = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please login to register for events.");
        return;
      }
      setLoading(true);
      const resgistrationsRef = collection(firestore, "registrations");
      const q = query(
        resgistrationsRef,
        where("eventId", "==", event.id),
        where("userId", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("You have already registered for this event.");
        return;
      }

      const hasPayment = await checkPaymentStatus();
      if (event.fee > 0 && !hasPayment) {
        alert("Please pay the registration fee first.");
        navigation.navigat("PaymentScreen", { event });
        return;
      }

      await addDoc(collection(firestore, "registrations"), {
        eventId: event.id,
        userId: currentUser.uid,
        fullName,
        email,
        phone,
        collegeName,
        yearsOfStudy,
        timestamp: new Date(),
      });
      setLoading(false);
      alert("Registration Successfull");
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    navigation.navigate("PaymentScreen", { event });
  };

  if (loading) {
    return <Loader />
  }

  return (
    <View style={styles.container}>
      <Header title={"Event Registration"} navigation={navigation} />
      <ScrollView>
        <Image source={{ uri: event.image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.date}>{event.date}</Text>
          <Text style={styles.date}>{event.date} • {event.time}</Text>
          <Text style={styles.location}>{event.location}</Text>
          <Input
            label={"Full Name"}
            placeholder={"Enter your full name"}
            icon={"person"}
            value={fullName}
            onChangeText={setFullName}
          />
          <Input
            label={"Email Address"}
            placeholder={"your.email@university.edu"}
            icon={"email"}
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label={"Phone Number"}
            placeholder={"+91 1234567890"}
            icon={"phone"}
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label={"College Name"}
            placeholder={"Enter your college name"}
            icon={"school"}
            value={collegeName}
            onChangeText={setCollegeName}
          />
          <Input
            label={"Year of Study"}
            placeholder={"Select year"}
            icon={"calendar-today"}
            value={yearsOfStudy}
            onChangeText={setYearsOfStudy}
          />
          <Text style={styles.fee}>Registration Fee: ${event.fee}</Text>
          <Button title={"Pay Now"} colors={["#00c853", "#00e676"]} onPress={handlePay} />
          <View style={styles.paymentInfo}>
            <MaterialIcons name="lock" size={16} color={"#666"} />
            <Text style={styles.paymentText}>Secure Payment by Campus Pulse</Text>
          </View>
          <Button title={"Register Now"} onPress={handleRegister} />
          <Text style={styles.terms}>
            By registering, you agree to our <Text style={styles.link}>Terms</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 150,
  },
  details: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 16,
    color: "#666",
  },
  location: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  fee: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 10,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  paymentText: {
    marginLeft: 5,
    color: "#666",
  },
  terms: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  link: {
    color: "#6b48ff",
  },
});

export default EventRegistrationScreen;