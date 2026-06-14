// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFzxx7puma7RcMg6t7Jn3oJKyJggByeC8",
  authDomain: "pauzircc.firebaseapp.com",
  projectId: "pauzircc",
  storageBucket: "pauzircc.firebasestorage.app",
  messagingSenderId: "110637105049",
  appId: "1:110637105049:web:e42adf6f6167f71436dd08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app, analytics };
