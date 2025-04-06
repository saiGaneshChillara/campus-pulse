import React, { useState, useEffect } from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
import { auth, firestore } from "../firebase/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Header from "../components/Header";
import EventCard from "../components/EventCard";
import Loader from '../components/Loader';

const MyEventsScreen = ({ route, navigation }) => {
  const { category } = route.params || {}; // Undefined if no category is passed
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screenTitle, setScreenTitle] = useState("My Events"); // Dynamic titleif

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user && !category) {
        console.log("No user is logged in and no category provided");
        setEvents([]);
        return;
      }

      let eventDocs;
      if (category) {
        // Mode 1: Fetch all events of the specified category
        const categoryQuery = query(
          collection(firestore, "events"),
          where("category", "==", category)
        );
        const snapshot = await getDocs(categoryQuery);
        eventDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setScreenTitle(`Events in ${category}`);
      } else {
        // Mode 2: Fetch registered events for the user
        const registrationsQuery = query(
          collection(firestore, "registrations"),
          where("userId", "==", user.uid)
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);
        const registeredEventIds = registrationsSnapshot.docs.map(
          (doc) => doc.data().eventId
        );

        if (registeredEventIds.length === 0) {
          setEvents([]);
          return;
        }

        const eventsQuery = query(collection(firestore, "events"));
        const eventsSnapshot = await getDocs(eventsQuery);
        const allEvents = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        eventDocs = allEvents.filter((event) =>
          registeredEventIds.includes(event.id)
        );
        setScreenTitle("My Events");
      }

      setEvents(eventDocs);

      // Reminder logic only for registered events (not category view)
      if (!category) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setDate(tomorrow.getDate() + 1); // End of tomorrow

        for (const event of eventDocs) {
          const [startTimeStr] = event.time.split(" - "); // e.g., "2:00 PM"
          const eventDateTime = new Date(`${event.date} ${startTimeStr}`);
          if (
            eventDateTime >= tomorrow &&
            eventDateTime < endOfTomorrow &&
            !event.reminderSent // Optional: Avoid duplicate reminders
          ) {
            await addDoc(collection(firestore, "notifications"), {
              userId: user.uid,
              title: `Reminder: ${event.title}`,
              description: `Your event "${event.title}" is happening tomorrow at ${event.time}!`,
              type: "reminder",
              timestamp: new Date(),
              read: false,
            });
            // Optionally update event with reminderSent: true
            // await updateDoc(doc(firestore, 'events', event.id), { reminderSent: true });
          }
        }
      }
    } catch (err) {
      console.log("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category]); // Re-run when category changes

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Header title={screenTitle} navigation={navigation} />
      {events.length === 0 ? (
        <Text style={styles.noEvents}>
          {category
            ? `No events available in ${category}.`
            : "You haven't registered for any events yet."}
        </Text>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <EventCard
              title={item.title}
              date={item.date}
              time={item.time}
              location={item.location}
              image={item.image}
              status={category ? undefined : "Registered"} // Only show status for registered events
              onPress={() => navigation.navigate("EventDetails", { event: item })}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  noEvents: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyEventsScreen;