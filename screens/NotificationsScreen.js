// screens/NotificationsScreen.js
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import Loader from '../components/Loader';
import NotificationCard from '../components/NotificationCard';
import { auth, firestore } from '../firebase/firebaseConfig';

const NotificationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]); // Fixed typo from setNotificaitons to setNotifications

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const now = new Date();
    const notificationDate = timestamp.toDate();
    const diffSeconds = Math.floor((now - notificationDate) / 1000);

    const minutes = Math.floor(diffSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 1) return `${days} days ago`;
    if (days === 1) return "Yesterday";
    if (hours >= 1) return `${hours} hours ago`;
    if (minutes >= 1) return `${minutes} minutes ago`;
    return "Just now";
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is logged in");
        setNotifications([]);
        return;
      }

      const notificationsQuery = query(collection(firestore, 'notifications'), where('userId', '==', user.uid));

      const querySnapshot = await getDocs(notificationsQuery);
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: formatTimeAgo(doc.data().timestamp),
      }));

      setNotifications(notificationsData);
    } catch (err) {
      console.log("Failed to fetch notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
      console.log("Notifications fetched:", notificationsData);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = auth.currentUser;
      if (!user || notifications.length === 0) return;

      const batch = writeBatch(firestore);
      notifications.forEach((notification) => {
        if (!notification.read) { // Only update unread notifications
          const notificationRef = doc(firestore, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });

      await batch.commit();
      console.log("All notifications marked as read");
      // Optionally refetch notifications to reflect the updated state
      fetchNotifications();
    } catch (err) {
      console.log("Error marking notifications as read:", err);
    }
  };

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchNotifications();
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      markAllAsRead();
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, notifications]); // Added notifications as dependency to ensure markAllAsRead uses the latest list

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Header title="Notifications" navigation={navigation} />
      <View style={styles.tabs}>
        <Button title="Notifications" style={styles.tabButton} />
        {/* <Button title="Reminders" style={styles.tabButtonOutline} />
        <Button title="Updates" style={styles.tabButtonOutline} /> */}
      </View>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationCard
            title={item.title}
            description={item.description}
            time={item.time}
            type={item.type}
          />
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.noNotifications}>No notifications available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  tabButtonOutline: {
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noNotifications: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationsScreen;