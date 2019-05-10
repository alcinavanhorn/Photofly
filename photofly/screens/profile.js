import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import { database } from '../config/config.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Feed from '../components/feed.js';

console.disableYellowBox = true; //disable Setting a timer for a long period of time warning

class profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  componentDidMount = () => {
    this.checkParams();
  };

  //If user ID exists, run fetchUserInfo
  checkParams = () => {
    var params = this.props.navigation.state.params;
    if (params) {
      if (params.userId) {
        this.setState({
          userId: params.userId,
        });
        this.fetchUserInfo(params.userId);
      }
    }
  };

  //Get user info for displaying
  fetchUserInfo = userId => {
    var that = this;

    database
      .ref('users')
      .child(userId)
      .child('username')
      .once('value')
      .then(function (snapshot) {
        const exists = snapshot.val() !== null;
        if (exists) var data = snapshot.val();
        that.setState({ username: data, loaded: true });
      })
      .catch(error => console.log(error));

  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.loaded == false ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading</Text>
          </View>
        ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <Text />
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'white' }}>
                  {this.state.username}
                </Text>
                <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                  <MaterialCommunityIcons
                    style={{ paddingRight: 10 }}
                    name="close"
                    size={25}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
              <Feed
                isUser={true}
                userId={this.state.userId}
                navigation={this.props.navigation}
              />
            </View>
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbe7e2',
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
});

export default profile;