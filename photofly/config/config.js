import firebase from 'firebase';

const config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};
firebase.initializeApp(config);

export const fire = firebase;
export const database = firebase.database();
export const auth = firebase.auth();
export const storage = firebase.storage();
