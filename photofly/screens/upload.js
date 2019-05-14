import React from 'react';
import {
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  View,
  Image,
  StyleSheet,
} from 'react-native';
import { fire, database, storage } from '../config/config.js';
import { Permissions, ImagePicker } from 'expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

console.disableYellowBox = true; //disable Setting a timer for a long period of time warning

class upload extends React.Component {
  //bottom navigation options
  static navigationOptions = {
    tabBarIcon: ({ focused, tintColor }) => {
      let iconName = `plus-circle${focused ? '' : '-outline'}`;
      tintColor = '#ffffff';
      return (
        <MaterialCommunityIcons name={iconName} size={25} color={tintColor} />
      );
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      imageId: this.uniqueId(),
      imageSelected: false,
      uploading: false,
      caption: '',
      progress: 0
    };
  }

  //Check camera and gallery permissions
  checkPermissions = async () => {
    await Permissions.askAsync(Permissions.CAMERA);
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
  };


  //Creates a series of random numbers to form a unique ID for the photos that are uploaded
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

  //Find new image from the gallery for uploading
  findNewImage = async () => {
    this.checkPermissions();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      quality: 1,
    });
    if (!result.cancelled) {
      console.log('Uploading');
      this.setState({
        imageSelected: true,
        imageId: this.uniqueId(),
        uri: result.uri,
      });
    } else {
      console.log('Upload cancelled');
      this.setState({
        imageSelected: false
      });
    }
  };

  //Let user take a new image with their camera for uploading
  takeNewImage = async () => {
    this.checkPermissions();

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'Images',
      quality: 1,
    });
    if (!result.cancelled) {
      console.log('Uploading');
      this.setState({
        imageSelected: true,
        imageId: this.uniqueId(),
        uri: result.uri,
      });
    } else {
      console.log('Upload cancelled');
      this.setState({
        imageSelected: false,
      });
    }
  };

  //Function to clear the upload page once uploading and processing is done
  clearUpload = () => {
    this.setState({
      uploading: false,
      imageSelected: false,
      caption: '',
      uri: '',
    });
  };

  //Function for checking the caption is not empty and then uploads the image and caption with uploadImage function
  publish = () => {
    if (this.state.uploading == false) {
      if (this.state.caption != '') {
        this.uploadImage(this.state.uri);
      } else {
        alert('Please enter a caption');
      }
    } else {
      console.log('Already uploading');
    }
  };
  
  //Function to set up the upload and promise
  uploadImage = async uri => {
    var imageId = this.state.imageId;

    this.setState({
      uploading: true,
    });

    var filePath = imageId;

    const oReq = new XMLHttpRequest();
    oReq.open('GET', uri, true);
    oReq.responseType = 'blob';
    oReq.onload = () => {
      const blob = oReq.response;
      //Call function to complete upload with the new blob
      this.completeUpload(filePath, blob);
    };
    oReq.send();
  };

  //Function to complete the blob promise from upload function and upload the image to firebase storage
  completeUpload = (filePath, blob) => {
    var that = this;
    var userId = fire.auth().currentUser.uid;

    //Set up upload path to firebase storage
    var uploadTask = storage
      .ref('user/' + userId + '/img')
      .child(filePath)
      .put(blob);

    //Firebase upload task to upload the image data
    uploadTask.on(
      fire.storage.TaskEvent.STATE_CHANGED,
      function(snapshot) {
        var progress = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0);
        console.log('Upload is ' + progress + '% complete');
        that.setState({
          progress: progress,
        });
      },
      function(error) {
        console.log(error);
      },
      function() {
        //Give the image URL for processImage when the upload progress is 100%
        that.setState({ progress: 100 });
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          that.processImage(downloadURL);
        });
      }
    );
  };
  
  //Function to set the data to the database for uploaded images from storage
  processImage = downloadURL => {
    var imageId = this.state.imageId;
    var userId = fire.auth().currentUser.uid;
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime / 1000);
    var caption = this.state.caption;

    //Builds the photo object for adding to the database
    var photoObj = {
      author: userId,
      caption: caption,
      timestamp: timestamp,
      url: downloadURL
    };

    //Add the photo to the feed
    database.ref('/photos/' + imageId).set(photoObj);

    //Set photo object for the user
    database.ref('/users/' + userId + '/photos/' + imageId).set(photoObj);

    //Alerts the user that the upload is done and clears the upload page
    alert('Image uploaded');
    this.clearUpload();
  };

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
        {this.state.imageSelected == true ? (
          <View style={{ flex: 1 }}>
            <View style={{ marginTop: 25, padding: 5 }}>
              <Image
                source={{ uri: this.state.uri }}
                style={{
                  resizeMode: 'cover',
                  aspectRatio: 1,
                  width: 100,
                  marginTop: 10,
                }}
              />
            </View>
            {this.state.uploading == true ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                }}>
                <Text>{this.state.progress}%</Text>
                {this.state.progress != 100 ? (
                  <ActivityIndicator size="small" color="#8dcfb5" />
                ) : (
                  <Text>Processing</Text>
                )}
              </View>
            ) : (
              <View>
                <View style={{ flex: 1, margin: 10 }}>
                  <TextInput
                    placeholder={'Enter your caption...'}
                    maxLength={150}
                    multiline={true}
                    numberOfLine={4}
                    onChangeText={text => this.setState({ caption: text })}
                    style={styles.textInput}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end',  marginTop: 30 }}>
                    <TouchableOpacity
                      onPress={this.publish}
                      style={styles.button}>
                      <Text style={{ textAlign: 'center', color: 'white' }}>
                        Upload
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={this.clearUpload}
                      style={styles.button}>
                      <Text style={{ textAlign: 'center', color: 'white' }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={{flex: 1, flexDirection: 'row',justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={this.findNewImage}
              style={styles.imageTaker}>
              <MaterialCommunityIcons
                name="image-filter"
                size={25}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.takeNewImage}
              style={styles.imageTaker}>
              <MaterialCommunityIcons name="camera" size={25} color="white" />
            </TouchableOpacity>
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
    borderWidth: 0.5,
    backgroundColor: '#8dcfb5',
  },
  textInput: {
    height: 100,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,
  },
  imageTaker: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginLeft: 15,
    backgroundColor: '#8dcfb5',
    borderRadius: 50,
  },
  button: {
    alignSelf: 'center',
    width: 100,
    backgroundColor: '#8dcfb5',
    borderRadius: 50,
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});

export default upload;
