import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";
import { categories as staticCats } from "../static/categories";
import { uploadImageToCloudinary } from "../utils/cloudinary";

const CreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [fee, setFee] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentScannerImage, setPaymentScannerIamge] = useState(null);

  const [categories] = useState(staticCats);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickPaymentScannerImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPaymentScannerIamge(result.assets[0].uri);
    }
  };

  const handleDateConfirm = (selectedDate) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };

  const handleStartTimeConfirm = (selectedTime) => {
    setShowStartTimePicker(false);
    setStartTime(selectedTime);
  };

  const handleEndTimeConfirm = (selectedTime) => {
    setShowEndTimePicker(false);
    setEndTime(selectedTime);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };



  const formateTime = (start, end) => {
    const formatOptions = { hour: "numeric", minute: "2-digit", hour12: true };
    const startTime = start.toLocaleTimeString("en-US", formatOptions);
    const endTime = end.toLocaleTimeString("en-US", formatOptions);

    return `${startTime} - ${endTime}`;
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const onTimeStartChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === "ios");
    setStartTime(currentTime);
  };

  const onTimeEndChange = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === "ios");
    setEndTime(currentTime);
  };

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to create an event");
      }

      let imageUrl = "";
      let paymentScannerImageUrl = "";
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      if (paymentScannerImage) {
        paymentScannerImageUrl = await uploadImageToCloudinary(paymentScannerImage);
      }


      await addDoc(collection(firestore, "events"), {
        title,
        date: formatDate(date),
        time: formateTime(startTime, endTime),
        location,
        fee: parseFloat(fee) || 0,
        description,
        image: imageUrl,
        paymentScannerImage: paymentScannerImageUrl,
        category,
        creator: currentUser.uid,
        trending: Math.random() <= 0.3,
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        <Header title={"Create Event"} navigation={navigation} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error && <Text style={styles.error}>{error}</Text>}
          <Input
            label={"Event Title"}
            placeholder={"Enter event title"}
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={() => setShowDatePicker(false)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Time</Text>
            <View style={styles.timeContainer}>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeText}>
                  {startTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
              <Text style={styles.timeSeparator}> - </Text>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeText}>
                  {endTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePickerModal
              isVisible={showStartTimePicker}
              mode="time"
              onConfirm={handleStartTimeConfirm}
              onCancel={() => setShowStartTimePicker(false)}
            />
            <DateTimePickerModal
              isVisible={showEndTimePicker}
              mode="time"
              onConfirm={handleEndTimeConfirm}
              onCancel={() => setShowEndTimePicker(false)}
            />
          </View>
          <Input
            label={"Location"}
            placeholder={"Enter location"}
            value={location}
            onChangeText={setLocation}
          />
          <Input
            label={"Registration Fee"}
            placeholder={"Enter registration fee (e.g., 149.50)"}
            value={fee}
            onChangeText={setFee}
            keyboardType="numeric"
          />
          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter event description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
                dropdownIconColor="#666"
              >
                <Picker.Item label="Select a category" value="" />
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat.id}
                    label={cat.title}
                    value={cat.title}
                    color={cat.color}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadText}>
              {image ? "Event Image Uploaded" : "Upload Event Image"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={pickPaymentScannerImage}>
            <Text style={styles.uploadText}>
              {paymentScannerImage ? "Scanner image uploaded" : "Upload scanner image"}
            </Text>
          </TouchableOpacity>
          <Button title={"Create Event"} onPress={handleCreateEvent} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
  },
  uploadText: {
    color: "#666",
  },
  textAreaContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 16,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  inputContainer: {
    marginVertical: 10,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  timeSeparator: {
    fontSize: 16,
    color: "#333",
    marginHorizontal: 10,
  },
});

export default CreateEventScreen;