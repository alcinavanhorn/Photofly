import React from 'react';
import {
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { auth, database } from '../config/config.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

console.disableYellowBox = true; //disable Setting a timer for a long period of time warning

class signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  //Object for creating the user info for database
  createUserObj = (userObj, email, username) => {
    console.log(userObj, email, userObj.uid);
    var uObj = {
      username: username,
      email: email,
    };
    database
      .ref('users')
      .child(userObj.uid)
      .set(uObj);
  };

  //Signup user with username, email, and password, and check for matching password
  signup = async () => {
    let email = this.state.email;
    let password = this.state.password;
    let username = this.state.username;
    let confirmPassword = this.state.confirmPassword;
    if (
      email != '' &&
      password != '' &&
      password == confirmPassword &&
      username != ''
    ) {
      try {
        let user = await auth
          .createUserWithEmailAndPassword(email, password)
          .then(userObj => this.createUserObj(userObj.user, email, username))
          .then(() => this.props.navigation.navigate('Home'))
          .catch(error => alert(error));
      } catch (error) {
        console.log(error);
        alert(error);
      }
    } else if (password != confirmPassword) {
      alert('Passwords do not match');
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding">
          <View>
            <View>
              <TextInput
                placeholder={'Enter your username'}
                onChangeText={text => this.setState({ username: text })}
                value={this.state.username}
                style={styles.textInput}
              />
              <TextInput
                keyboardType={'email-address'}
                placeholder={'Enter your email address'}
                onChangeText={text => this.setState({ email: text })}
                value={this.state.email}
                style={styles.textInput}
              />
              <TextInput
                secureTextEntry={true}
                placeholder={'Enter your password'}
                onChangeText={text => this.setState({ password: text })}
                value={this.state.password}
                style={styles.textInput}
              />
              <TextInput
                editable={true}
                secureTextEntry={true}
                placeholder={'Confirm your password'}
                onChangeText={text => this.setState({ confirmPassword: text })}
                value={this.state.confirmPassword}
                style={styles.textInput}
              />
              <TouchableOpacity
                onPress={() => this.signup()}
                style={styles.confirm}>
                <Text style={styles.button}>Sign up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('Login')}
                style={{
                  borderBottomWidth: 1,
                  paddingVertical: 5,
                  marginBottom: 10,
                  borderBottomColor: 'black',
                }}>
                <View style={{ flexDirection: 'row' }}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={20}
                    color="#103f2c"
                  />
                  <Text style={styles.text}>Back to login</Text>
                </View>
              </TouchableOpacity>
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
  confirm: {
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
  button: {
    fontWeight: 'bold',
    color: '#8dcfb5',
    alignSelf: 'center',
  },
});

export default signup;
