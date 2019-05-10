import React from 'react';
import {
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fire, database } from '../config/config.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

console.disableYellowBox = true; //disable Setting a timer for a long period of time warning

class comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commentList: [],
    };
  }

  componentDidMount = () => {
    this.checkParams();
  };

  //Checks if photoId exists and sends it to the fetchComments function 
  checkParams = () => {
    var params = this.props.navigation.state.params;
    if (params) {
      if (params.photoId) {
        this.setState({
          photoId: params.photoId,
        });
        this.fetchComments(params.photoId);
      }
    }
  };

  //Creates a series of random numbers to form a unique ID for the comments
  random = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };

  //Places the random numbers into an ID formation
  uniqueId = () => {
    return (
      this.random() +
      '-' +
      this.random() +
      '-' +
      this.random() +
      '-' +
      this.random() +
      '-' +
      this.random() +
      '-' +
      this.random() +
      '-' +
      this.random()
    );
  };

  //Used for adding a plural to the timestamp
  plural = s => {
    if (s == 1) {
      return ' ago';
    } else {
      return 's ago';
    }
  };

  //Converts UNIX time to a readable time for the photo's timestamp
  converter = time => {
    var a = new Date(time * 1000);
    var seconds = Math.floor((new Date() - a) / 1000);

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval + ' year' + this.plural(interval);
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval + ' month' + this.plural(interval);
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + ' day' + this.plural(interval);
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + ' hour' + this.plural(interval);
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + ' minute' + this.plural(interval);
    }

    return Math.floor(seconds) + ' second' + this.plural(seconds);
  };

  //Function fetches the comments from the database by the photo's ID
  fetchComments = photoId => {
    var that = this;

    database
      .ref('comments')
      .child(photoId)
      .orderByChild('timestamp')
      .once('value')
      .then(function (snapshot) {
        const exists = snapshot.val() !== null;
        if (exists) {
          var data = snapshot.val();
          var commentList = that.state.commentList;

          //If comment field has data, send the comment data to the addComment function
          for (var comment in data) {
            that.addComment(commentList, data, comment);
          }
        } else { //If no data exists in the comment snapshot, show empty comment
          that.setState({
            commentList: [],
          });
        }
      })
      .catch(error => console.log(error));
  };

  //Adds a comment to the commentList
  addComment = (commentList, data, comment) => {
    var that = this;
    var commentObj = data[comment]; //get comment data from the array

    database
      .ref('users')
      .child(commentObj.author)
      .child('username')
      .once('value')
      .then(function (snapshot) {
        const exists = snapshot.val() !== null;
        if (exists) data = snapshot.val();

        //Pushes the new comment to the database
        commentList.push({
          id: comment,
          comment: commentObj.comment,
          timestamp: that.converter(commentObj.timestamp),
          author: data,
          authorId: commentObj.author,
        });

        that.setState({
          refresh: false,
          loading: false,
        });
      })
      .catch(error => console.log(error));
  };

  //Function to post a comment into the database by first creating
  postComment = () => {
    var comment = this.state.comment;
    if (comment != '') {
      var imageId = this.state.photoId;
      var userId = fire.auth().currentUser.uid;
      var commentId = this.uniqueId();
      var dateTime = Date.now();
      var timestamp = Math.floor(dateTime / 1000);

      this.setState({
        comment: '',
      });

      var commentObj = {
        timestamp: timestamp,
        author: userId,
        comment: comment,
      };

      //set new comment under the specific photo in the database
      database.ref('/comments/' + imageId + '/' + commentId).set(commentObj);

      //reload comment and clear the comment field
      this.reloadComments();
      this.clear();
    } else {
      alert('Comment field empty');
    }
  };

  reloadComments = () => {
    this.setState({
      commentList: [],
    });
    this.fetchComments(this.state.photoId);
  };

  clear = () => {
    this.textInputRef.clear();
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text />
          <Text style={styles.title}>Comments</Text>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <MaterialCommunityIcons name="close" size={25} color="white" />
          </TouchableOpacity>
        </View>
        {this.state.commentList.length != 0 ? (
          //Show comments if they exist in the list
          <FlatList
            refreshing={this.state.refresh}
            data={this.state.commentList}
            keyExtractor={item => item.id.toString()}
            style={{ flex: 1 }}
            renderItem={({ item, index }) => (
              <View
                key={index}
                style={{ width: '100%', overflow: 'hidden', marginBottom: 5, justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'grey' }}>
                <View
                  style={{ padding: 5, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('User', {
                        userId: item.authorId,
                      })
                    }>
                    <Text>{item.author}</Text>
                  </TouchableOpacity>
                  <Text>{item.timestamp}</Text>
                </View>
                <View style={{ padding: 5 }}>
                  <Text>{item.comment}</Text>
                </View>
              </View>
            )}
          />
        ) : (
            //If there are no comments, show empty screen
            <Text style={{ alignSelf: 'center', margin: 10 }}>
              No comments found
          </Text>
          )}
        <KeyboardAvoidingView
          behavior="padding"
          enabled
          style={{
            borderTopWidth: 1,
            borderTopColor: 'grey',
            padding: 10,
            marginBottom: 15,
          }}>
          <View>
            <TextInput
              ref={ref => (this.textInputRef = ref)}
              editable={true}
              placeholder={'Enter a comment'}
              onChangeText={text => this.setState({ comment: text })}
              style={styles.textInput}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.postComment()}>
              <Text>Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c0dcd0',
  },
  title: {
    fontWeight: 'bold',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    height: 70,
    paddingTop: 30,
    backgroundColor: '#8dcfb5',
    borderBottomWidth: 0.5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    marginVertical: 10,
    height: 50,
    padding: 5,
    borderRadius: 3,
    backgroundColor: 'white',
    color: 'black',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontWeight: 'bold',
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    borderRadius: 5,
  },
});

export default comments;
