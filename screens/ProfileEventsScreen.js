import { FlatList, StyleSheet, View } from "react-native";
import Header from "../components/Header";
import EventCard from "../components/EventCard";

const ProfileEventsScreen = ({ route, navigation }) => {
  const { events, title } = route.params;
  // console.log()
  // console.log("Events are:", events);
  return (
    <View style={styles.container}>
      <Header title={title} navigation={navigation} />
      <FlatList 
        data={events}
        renderItem={({ item }) => (
          <EventCard 
            title={item.title}
            date={item.date}
            time={item.time}
            location={item.location}
            image={item.image}
            status={title === "Registered Events" ? "Registered" : "Participated"}
            onPress={() => navigation.navigate("EventDetails", {
              event: item
            })}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
});

export default ProfileEventsScreen;