import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";

const EventDetailsScreen = ({ route, navigation }) => {
  const { event } = route.params;

  const [registerd, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setRegistered(false);
          setLoading(false);
          return;
        }

        const registrationsRef = collection(firestore, "registrations");
        const q = query(
          registrationsRef,
          where("eventId", "==", event.id),
          where("userId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        setRegistered(!querySnapshot.empty);
      } catch (err) {
        console.log("Error in checking registration: ", err);
      } finally {
        setLoading(false);
      }
    };

    const checkCreator = async () => {
      const user = auth.currentUser;
      if (user && event.creator === user.uid) {
        setIsCreator(true);
      }
    };

    checkRegistration();
    checkCreator();
  }, [event.id]);

  if (loading) return (
    <Loader />
  );

  return (
    <View style={styles.container}>
      <Header title={"Event Details"} navigation={navigation} />
      <ScrollView>
        <Image source={{ uri: event.image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.subtitle}>Join us for the biggest event of the year</Text>
          <View style={styles.info}>
            <MaterialIcons name="calendar-today" size={16} color="#666" />
            <Text style={styles.infoText}>{event.date}</Text>
          </View>
          <View style={styles.info}>
            <MaterialIcons name="access-time" size={16} color={"#666"} />
            <Text style={styles.infoText}>{event.time}</Text>
          </View>
          <View style={styles.info}>
            <MaterialIcons name="location-on" size={16} color={"#666"} />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
          {registerd ? (
            <Button title={"Already Registered"} />
          ) : (
            <>
              <Button title="Register" onPress={() => navigation.navigate('EventRegistration', { event: event })} />
              <Button title="Add to Calendar" style={styles.calendarButton} />
            </>
          )}

          {isCreator && (
            <Button 
              title={"Modify Event"}
              colors={["#ff9800", "#ffb300"]}
              onPress={() => navigation.navigate("ModifyEvent", { event })}
            />
          )}

          <Text style={styles.sectionTitle}>About the Event</Text>
          <Text style={styles.description}>
            {event.description || `This is an event organized by ${event.creator || "Principal"}`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
  },
  details: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
  },
  calendarButton: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});

export default EventDetailsScreen;