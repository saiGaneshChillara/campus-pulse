import { MaterialIcons } from "@expo/vector-icons";
import { addDoc, collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";

const AdminScreen = ({ navigation }) => {
  const [tentativeEvents, setTentativeEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAdminAndFetchEvents = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setError('You must be logged in as admin to view this page');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(firestore, 'admins', user.uid));
        if (!userDoc.exists()) {
          setError('You dont have permission to this page');
          setLoading(false);
          return;
        }

        const eventsSnapshot = await getDocs(collection(firestore, 'tentativeEvents'));
        const eventList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTentativeEvents(eventList);
      } catch (err) {
        setError('Error in fetching events' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchEvents();
  }, []);

  const handleApproveEvent = async (event) => {
    try {
      const batch = writeBatch(firestore);
      const eventRef = await addDoc(collection(firestore, 'events'), {
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        fee: event.fee,
        description: event.description,
        image: event.image,
        paymentScannerImage: event.paymentScannerImage,
        category: event.category,
        creator: event.creator,
        trending: event.trending,
        createdAt: new Date(),
      });

      // Send notification to creator
      const notificationRef = doc(collection(firestore, 'notifications'));
      batch.set(notificationRef, {
        userId: event.creator,
        title: `Event Approved: ${event.title}`,
        description: `Your event "${event.title}" has been approved and is now live!`,
        type: 'approval',
        timestamp: new Date(),
        read: false,
      });

      // Delete from tentativeEvents
      const tentativeEventRef = doc(firestore, 'tentativeEvents', event.id);
      batch.delete(tentativeEventRef);

      // Commit the batch
      await batch.commit();

      // Update local state
      setTentativeEvents(tentativeEvents.filter(e => e.id !== event.id));
      Alert.alert('Success', 'Event approved successfully!');

    } catch (err) {
      Alert.alert('Error', 'Failed to approve event: ' + err.message);
    }
  };

  const handleRejectEvent = async (event) => {
    try {
      const batch = writeBatch(firestore);

      // Send notification to creator
      const notificationRef = doc(collection(firestore, 'notifications'));
      batch.set(notificationRef, {
        userId: event.creator,
        title: `Event Rejected: ${event.title}`,
        description: `Your event "${event.title}" has been rejected and removed.`,
        type: 'rejection',
        timestamp: new Date(),
        read: false,
      });

      // Delete from tentativeEvents
      const tentativeEventRef = doc(firestore, 'tentativeEvents', event.id);
      batch.delete(tentativeEventRef);

      // Commit the batch
      await batch.commit();

      // Update local state
      setTentativeEvents(tentativeEvents.filter(e => e.id !== event.id));
      Alert.alert('Success', 'Event rejected and deleted successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to reject the event: ' + err.message);
    }
  };

  const confirmReject = (eventId) => {
    Alert.alert(
      'Reject Event',
      'Are you sure you want to reject this event? It will be deleted permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => handleRejectEvent(eventId) },
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut(); // Sign out the user
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }); // Reset navigation stack to LoginScreen
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out: ' + error.message);
    }
  };

  // Confirm sign out
  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
      ]
    );
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.eventImage} />
      )}
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventInfo}>Date: {item.date}</Text>
        <Text style={styles.eventInfo}>Time: {item.time}</Text>
        <Text style={styles.eventInfo}>Location: {item.location}</Text>
        <Text style={styles.eventInfo}>Fee: ${item.fee.toFixed(2)}</Text>
        <Text style={styles.eventInfo}>Category: {item.category}</Text>
        <Text style={styles.eventInfo}>Description: {item.description}</Text>
        {item.paymentScannerImage && (
          <Image source={{ uri: item.paymentScannerImage }} style={styles.scannerImage} />
        )}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]} onPress={() => handleApproveEvent(item)}
          >
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => confirmReject(item)}
          >
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={confirmSignOut}>
      <Text style={styles.actionButtonText}>Sign Out</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel - Tentative Events</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {tentativeEvents.length === 0 ? (
        <View style={styles.innerContainer}>
          <Text style={styles.noEvents}>No tentative events to review.</Text>
          {renderFooter()}
        </View>
      ) : (
        <FlatList
          data={tentativeEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventList}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    height: 100,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  noEvents: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  eventList: {
    padding: 15,
    paddingBottom: 20, // Add padding to ensure Sign Out button is not too close to the bottom
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  scannerImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
  },
  eventDetails: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  signOutButton: {
    backgroundColor: '#F44336', // Same red as reject button
    marginHorizontal: 0, // Remove horizontal margin to match list width
    marginTop: 10, // Add some spacing above the button
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminScreen;