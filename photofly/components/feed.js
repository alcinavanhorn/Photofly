import React from 'react';
import { TouchableOpacity, FlatList, Text, View, Image } from 'react-native';
import { database } from '../config/config.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

console.disableYellowBox = true; //disable Setting a timer for a long period of time warning

class Feed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoFeed: [],
      refresh: false,
      loading: true,
      empty: false,
    };
  }

  componentDidMount = () => {
    const { isUser } = this.props;
    if (isUser == true) {
      //If user is the user, pass user ID to show only their photos
      this.loadFeed(this.props.userId);
    } else {
      this.loadFeed('');
    }
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

  //Function to add photos and data into the feed
  photosList = (photoFeed, data, photo) => {
    var that = this;
    var photoObj = data[photo];

    database
      .ref('users')
      .child(photoObj.author)
      .child('username')
      .once('value')
      .then(function (snapshot) {
        const exists = snapshot.val() !== null;
        if (exists) var data = snapshot.val();
        photoFeed.push({
          id: photo,
          url: photoObj.url,
          caption: photoObj.caption,
          timestamp: that.converter(photoObj.timestamp),
          posted: photoObj.timestamp,
          author: data,
          authorId: photoObj.author,
        });

        var myData = [].concat(photoFeed).sort((a, b) => a.posted < b.posted);

        that.setState({
          refresh: false,
          loading: false,
          photoFeed: myData,
        });
      })
      .catch(error => console.log(error));
  };

  //Function to load the feed
  loadFeed = (userId = '') => {
    this.setState({
      refresh: false,
      photoFeed: [],
    });

    var that = this;

    //Load all photos unless user ID is recognized (used for viewing single user's photos)
    var feedRef = database.ref('photos');
    if (userId != '') {
      feedRef = database
        .ref('users')
        .child(userId)
        .child('photos');
    }
    //Fetch photo data and order by timestamp
    feedRef
      .once('value')
      .then(function (snapshot) {
        //Check if photos exist in the database
        const exists = snapshot.val() !== null;
        if (exists) {
          var data = snapshot.val();
          var photoFeed = that.state.photoFeed;

          that.setState({ empty: false });
          for (var photo in data) {
            that.photosList(photoFeed, data, photo);
          }
        } else {
          that.setState({ empty: true });
        }
      })
      .catch(error => console.log(error));
  };

  //Function for when page is refreshed
  reload = () => {
    if (this.props.userId != '') {
      this.loadFeed(this.props.userId);
    } else {
      this.loadFeed();
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.loading == true ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {this.state.empty == true ? (
              <Text>Nothing to see here!</Text>
            ) : (
                <Text>Loading...</Text>
              )}
          </View>
        ) : (
            <FlatList
              refreshing={this.state.refresh}
              onRefresh={this.reload}
              data={this.state.photoFeed}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View>
                  <View
                    style={{ padding: 5, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('Profile', {
                          userId: item.authorId,
                        })
                      }>
                      <Text>{item.author}</Text>
                    </TouchableOpacity>
                    <Text>{item.timestamp}</Text>
                  </View>
                  <View>
                    <Image
                      source={{ uri: item.url }}
                      style={{ resizeMode: 'cover', width: '100%', height: 275 }}
                    />
                  </View>
                  <View style={{ padding: 5, backgroundColor: 'white' }}>
                    <Text>{item.caption}</Text>
                    <TouchableOpacity
                      style={{ alignItems: 'flex-end' }}
                      onPress={() =>
                        this.props.navigation.navigate('Comments', {
                          photoId: item.id,
                        })
                      }>
                      <MaterialCommunityIcons
                        name="comment-outline"
                        size={35}
                        color="#8dcfb5"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
      </View>
    );
  }
}

export default Feed;
