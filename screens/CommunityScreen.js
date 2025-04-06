import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import Button from "../components/Button";
import DiscussionCard from "../components/DiscussionCard";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";
import axiosInstance from "../utils/axiosInstance";

// Function to generate a random 6-character string
const generateRandomId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const CommunityScreen = ({ navigation }) => {
  const [discussions, setDiscussions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/community/discussions");
      setDiscussions(response.data);
      // console.log("Response data is", JSON.stringify(response.data));
      setLoading(false);
    } catch (err) {
      console.log("Error in fetching discussions", err);
      setDiscussions([]);
      setLoading(false);
    }
  };

  const startNewDiscussion = async () => {
    if (!newDiscussionTitle.trim()) {
      alert("Please enter a discussion title.");
      return;
    }

    try {
      // const user = auth.currentUser;
      const currentUser = auth.currentUser;
      // console.log("User creating discussion is", auth.currentUser);
      if (!currentUser) {
        alert("Please log in to start a discussion.");
        return;
      }

      const ref = doc(firestore, 'users', currentUser.uid);
      const snap = await getDoc(ref);
      const user = snap.data();

      console.log("User is", user);

      const currentTime = new Date(); // Use client-side timestamp instead of serverTimestamp()
      const newDiscussion = {
        posts: [
          {
            id: generateRandomId(),
            userId: currentUser.uid,
            userName: user.fullName || user.email.split("@")[0],
            userImage: user.collegeId || "https://res.cloudinary.com/dpfrwxe1r/image/upload/v1743422310/WIN_20250311_12_13_51_Pro_ueu367.jpg", // Fallback image
            time: currentTime.toISOString(), // Store as ISO string
            message: newDiscussionTitle,
            comments: 0,
            likes: 0,
          },
        ],
        createdAt: serverTimestamp(), // Server timestamp at document level
      };

      await addDoc(collection(firestore, "community"), newDiscussion);
      fetchDiscussions();
      setNewDiscussionTitle("");
    } catch (err) {
      console.log("Error starting discussion:", err);
      alert("Failed to start discussion. Please try again.");
    }
  };

  const addPostToDiscussion = async (discussionId, message) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in to post.");
        return;
      }

      const discussionRef = doc(firestore, "community", discussionId);
      const discussionDoc = await getDoc(discussionRef);
      if (!discussionDoc.exists()) {
        alert("Discussion not found.");
        return;
      }

      const currentTime = new Date(); // Use client-side timestamp
      const newPost = {
        id: generateRandomId(),
        userId: user.uid,
        userName: user.displayName || user.email.split("@")[0],
        userImage: user.collegId || "https://default-image-url.com",
        time: currentTime.toISOString(), // Store as ISO string
        message,
        comments: 0,
        likes: 0,
      };

      await updateDoc(discussionRef, {
        posts: [...discussionDoc.data().posts, newPost],
      });
      fetchDiscussions();
    } catch (err) {
      console.log("Error adding post:", err);
      alert("Failed to add post. Please try again.");
    }
  };

  useEffect(() => {
    fetchDiscussions();
    // const interval = setInterval(fetchDiscussions, 5000);
    // return () => clearInterval(interval);
  }, []);

  const filteredDiscussions = discussions.filter((discussion) =>
    discussion.posts.some((post) =>
      post.message.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  if (loading) {
    return <Loader />
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search discussions..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.discussionInput}
          placeholder="Start a new discussion..."
          placeholderTextColor="#999"
          value={newDiscussionTitle}
          onChangeText={setNewDiscussionTitle}
        />
        <Button title="Post" onPress={startNewDiscussion} style={styles.postButton} />
      </View>
      <FlatList
        data={filteredDiscussions}
        renderItem={({ item }) => (
          <DiscussionCard
            event={item.event}
            date={item.date}
            posts={item.posts}
            onAddPost={(message) => addPostToDiscussion(item.id, message)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noDiscussions}>No discussions found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  search: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  discussionInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
  },
  postButton: {
    minWidth: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDiscussions: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default CommunityScreen;