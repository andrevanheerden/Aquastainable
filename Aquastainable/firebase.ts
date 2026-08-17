// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyApePudibGEubX-VJjohgJ2Yl1vtir5564',
  authDomain: 'aquastainable.firebaseapp.com',
  projectId: 'aquastainable',
  storageBucket: 'aquastainable.firebasestorage.app',
  messagingSenderId: '711061991075',
  appId: '1:711061991075:web:def666823936493e84d916',
  measurementId: 'G-S9WD6WBPN3',
};

const app = initializeApp(firebaseConfig);

let analytics = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    analytics = null;
  });
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, firebaseConfig, auth, db };
