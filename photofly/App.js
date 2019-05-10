import React from 'react';
import {
  createAppContainer,
  createStackNavigator,
  createBottomTabNavigator,
} from 'react-navigation';

import home from './screens/home.js';
import upload from './screens/upload.js';
import user from './screens/user.js';
import profile from './screens/profile.js';
import comments from './screens/comments.js';
import login from './screens/login.js';
import signup from './screens/signup.js';


const TabStack = createBottomTabNavigator(
  {
    Home: { screen: home },
    Upload: { screen: upload },
    User: { screen: user },
  },
  {
    tabBarOptions: {
      style: {
        backgroundColor: '#8dcfb5',
      },
      activeTintColor: '#ffffff',
      inactiveTintColor: 'white',
    },
  }
);

const MainStack = createStackNavigator(
  {
    Home: { screen: TabStack },
    Login: { screen: login },
    Signup: { screen: signup },
    Profile: { screen: profile },
    Comments: { screen: comments },
  },
  {
    initialRouteName: 'Login',
    mode: 'modal',
    headerMode: 'none',
  }
);
export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <AppContainer />;
  }
}

const AppContainer = createAppContainer(MainStack);
