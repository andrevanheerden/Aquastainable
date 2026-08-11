const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_API_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || !FIREBASE_API_KEY) {
  console.error('Missing Firebase backend environment variables. Check backend/.env.example.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();
const auth = getAuth();

app.post('/signup', async (req, res) => {
  try {
    const { email, password, username, profileImageUrl } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'email, password, and username are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const createUserPayload = {
      email,
      password,
      displayName: username,
    };

    if (profileImageUrl) {
      createUserPayload.photoURL = profileImageUrl;
    }

    const userRecord = await auth.createUser(createUserPayload);

    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      username,
      profileImageUrl: profileImageUrl || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ uid: userRecord.uid, email: userRecord.email, username });
  } catch (error) {
    console.error(error);
    const message = error?.message || 'Failed to create user.';
    return res.status(500).json({ error: message });
  }
});

app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error?.response?.data || error);
    const message = error?.response?.data?.error?.message || error?.message || 'Unable to sign in.';
    return res.status(401).json({ error: message });
  }
});

app.listen(4000, () => {
  console.log('Backend listening on http://localhost:4000');
});
