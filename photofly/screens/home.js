import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Version can be specified in package.json

import Feed from '../components/feed.js';

console.disableYellowBox = true; //disable Setting a timer for a long period of time warning

class home extends React.Component {
  //bottom navigation options
  static navigationOptions = {
    tabBarIcon: ({ focused, tintColor }) => {
      let iconName = `home${focused ? '' : '-outline'}`;
      tintColor = '#ffffff';
      return (
        <MaterialCommunityIcons name={iconName} size={25} color={tintColor} />
      );
    },
  };

  //Calls for the feed component to show all photos in the feed
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="camera-iris"
            size={25}
            color="white"
            style={{ paddingLeft: 5 }}
          />
          <Text style={styles.title}>Photofly</Text>
        </View>
        <Feed isUser={false} navigation={this.props.navigation} />
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 70,
    paddingTop: 30,
    backgroundColor: '#8dcfb5',
    borderWidth: 0.5,
  },
});

export default home;