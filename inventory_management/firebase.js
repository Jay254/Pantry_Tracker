// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaPfoqHD9dlqF_Q4wYVLv8uiwgRankKds",
  authDomain: "inventory-management-eb500.firebaseapp.com",
  projectId: "inventory-management-eb500",
  storageBucket: "inventory-management-eb500.appspot.com",
  messagingSenderId: "991133167522",
  appId: "1:991133167522:web:e74bbd6d2b401823f84cfb",
  measurementId: "G-7Y3W4XH0JJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export {firestore}