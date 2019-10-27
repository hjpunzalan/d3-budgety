import 'materialize-css';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyA1S9VhPETB2i-CqQ2oJe945Q7bFWh2yDg',
	authDomain: 'd3-data-8437c.firebaseapp.com',
	databaseURL: 'https://d3-data-8437c.firebaseio.com',
	projectId: 'd3-data-8437c',
	storageBucket: 'd3-data-8437c.appspot.com',
	messagingSenderId: '790619401943',
	appId: '1:790619401943:web:79937b52ea332e195a0a92'
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
