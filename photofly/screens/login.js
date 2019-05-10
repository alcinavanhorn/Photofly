import React from 'react';
import {
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { auth } from '../config/config.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

console.disableYellowBox = true; //disable Setting a timer for a long period of time warning

class login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  //Login to the app with email and password
  login = async () => {
    var email = this.state.email;
    var password = this.state.password;
    if (email != '' && password != '') {
      try {
        let user = await auth
          .signInWithEmailAndPassword(email, password)
          .then(() => this.props.navigation.navigate('Home'));
      } catch (error) {
        console.log(error);
        alert(error);
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="position">
          <View>
            <MaterialCommunityIcons
              name="camera-iris"
              size={150}
              color="white"
              style={{ alignSelf: 'center' }}
            />
            <TextInput
              keyboardType={'email-address'}
              placeholder={'Enter your email address'}
              onChangeText={text => this.setState({ email: text })}
              value={this.state.email}
              style={styles.textInput}
            />
            <TextInput
              secureTextEntry
              placeholder={'Enter your password'}
              onChangeText={text => this.setState({ password: text })}
              value={this.state.password}
              style={styles.textInput}
            />
            <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => this.login()}
                style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', paddingVertical: 5, marginTop: 5 }}>
                <Text style={styles.text}>New to Photofly? </Text>
                <TouchableOpacity onPress={(() => this.props.navigation.navigate('Signup'))}>
                  <Text style={{ color: '#56d8a4', textDecorationLine: 'underline' }}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbe7e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 5,
    width: '100%',
  },
  textInput: {
    width: 250,
    marginVertical: 5,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  text: {
    color: '#103f2c',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#8dcfb5',
    alignSelf: 'center',
  },
});

export default login;
