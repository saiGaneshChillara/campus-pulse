// components/DiscussionCard.js
import { Image, StyleSheet, Text, View } from 'react-native';

const DiscussionCard = ({ event, date, posts }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.event}>{event}</Text>
      <Text style={styles.date}>{date}</Text>
      {posts.map(post => (
        <View key={post.id} style={styles.post}>
          <View style={styles.postHeader}>
            <Image source={{ uri: post.userImage }} style={styles.userImage} />
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.time}>{post.time}</Text>
          </View>
          <Text style={styles.message}>{post.message}</Text>
          {/* <View style={styles.actions}>
            <TouchableOpacity style={styles.action}>
              <MaterialIcons name="comment" size={16} color="#666" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action}>
              <MaterialIcons name="favorite" size={16} color="#666" />
              <Text style={styles.actionText}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action}>
              <MaterialIcons name="share" size={16} color="#666" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  event: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  post: {
    marginVertical: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 5,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 12,
  },
});

export default DiscussionCard;