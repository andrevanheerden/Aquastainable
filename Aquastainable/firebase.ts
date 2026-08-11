// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApePudibGEubX-VJjohgJ2Yl1vtir5564",
  authDomain: "aquastainable.firebaseapp.com",
  projectId: "aquastainable",
  storageBucket: "aquastainable.firebasestorage.app",
  messagingSenderId: "711061991075",
  appId: "1:711061991075:web:def666823936493e84d916",
  measurementId: "G-S9WD6WBPN3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics, firebaseConfig };
