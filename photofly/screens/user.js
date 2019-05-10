import React from 'react';
import {
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fire, database } from '../config/config.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Feed from '../components/feed.js';

console.disableYellowBox = true; //disable Setting a timer for a long period of time warning

class profile extends React.Component {
  //bottom navigation options
  static navigationOptions = {
    tabBarIcon: ({ focused, tintColor }) => {
      let iconName = `account${focused ? '' : '-outline'}`;
      tintColor = 'white';
      return (
        <MaterialCommunityIcons name={iconName} size={25} color={tintColor} />
      );
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
    };
  }

  //Fetch user ID from firebase
  componentDidMount = () => {
    var that = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
        that.fetchUserInfo(user.uid);
      } else {
        that.setState({
          loggedin: false,
        });
      }
    });
  };

  //Get user info based on user ID
  fetchUserInfo = userId => {
    var that = this;

    database
      .ref('users')
      .child(userId)
      .once('value')
      .then(function (snapshot) {
        const exists = snapshot.val() !== null;
        if (exists) var data = snapshot.val();
        that.setState({
          username: data.username,
          userId: userId,
        });
      });
  };

  //Function to log out the user from firebase
  logoutUser = () => {
    fire
      .auth()
      .signOut()
      .then(() => this.props.navigation.navigate('Login'));
    alert('Logged out');
  };

  //Set editing profile to be true so editing text inputs are shown in the render
  editProfile = () => {
    this.setState({ editingProfile: true });
  };

  //Store edited username to firebase
  saveProfile = () => {
    var username = this.state.username;

    if (username !== '') {
      database
        .ref('users')
        .child(this.state.userId)
        .child('username')
        .set(username);
    }
    this.setState({ editingProfile: false });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="camera-iris"
              size={25}
              color="white"
              style={{ paddingLeft: 5 }}
            />
            <Text style={styles.title}>Photofly</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
            {this.state.username}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={this.editProfile} style={styles.button}>
              <MaterialCommunityIcons
                name="account-edit"
                size={25}
                color="#8dcfb5"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.logoutUser} style={styles.button}>
              <MaterialCommunityIcons
                name="logout-variant"
                size={25}
                color="#8dcfb5"
              />
            </TouchableOpacity>
          </View>
        </View>
        {this.state.editingProfile == true ? (
          <View
            style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 20, borderBottomWidth: 1 }}>
            <Text>Username:</Text>
            <TextInput
              placeholder={'Change username'}
              onChangeText={text => this.setState({ username: text })}
              value={this.state.username}
              style={styles.textInput}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#8dcfb5', padding: 10 }}
              onPress={this.saveProfile}>
              <Text style={{ fontWeight: 'bold' }}>Save changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setState({ editingProfile: false })}>
              <Text style={{ fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
            <View />
          )}
        <Feed
          isUser={true}
          userId={this.state.userId}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbe7e2',
  },
  title: {
    fontWeight: 'bold',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    paddingTop: 30,
    borderWidth: 0.5,
    backgroundColor: '#8dcfb5',
  },
  textInput: {
    width: 250,
    marginVertical: 10,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  button: {
    margin: 5,
    marginBottom: 10,
    padding: 5,
    borderRadius: 50,
    backgroundColor: 'white',
  },
});

export default profile;
