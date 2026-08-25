const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const { randomUUID } = require('crypto');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

dotenv.config();

const createFishRouter = require('./fish/routes');
const createPlantRouter = require('./plant/routes');
const createAiRouter = require('./ai/routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.CLOUDINARY_URL) {
  const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL);
  cloudinary.config({
    cloud_name: cloudinaryUrl.hostname,
    api_key: decodeURIComponent(cloudinaryUrl.username),
    api_secret: decodeURIComponent(cloudinaryUrl.password),
    secure: true,
  });
}

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_API_KEY } = process.env;

if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY && FIREBASE_API_KEY) {
  admin.initializeApp({
    credential: admin.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
} else {
  console.warn('Firebase backend env vars missing; running in limited local mode. Firestore CRUD routes will be unavailable until .env is configured.');
}

const db = FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY && FIREBASE_API_KEY ? getFirestore() : null;
const auth = FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY && FIREBASE_API_KEY ? getAuth() : null;

app.use('/fish', createFishRouter({ db }));
app.use('/plants', createPlantRouter({ db }));
app.use('/ai', createAiRouter({ db }));

app.post('/water-tests', async (req, res) => {
  try {
    const { userId, tankId, readings = {}, image, testedAt } = req.body || {};
    if (!userId || !tankId || !testedAt) {
      return res.status(400).json({ error: 'userId, tankId, and testedAt are required.' });
    }
    if (!readings || !String(readings.ph || '').trim() || !String(readings.temperatureC || '').trim()) {
      return res.status(400).json({ error: 'pH and water temperature are required.' });
    }
    if (!db) {
      return res.status(503).json({ error: 'Database is not configured.' });
    }

    const normalizedReadings = Object.fromEntries(
      Object.entries(readings)
        .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
        .map(([key, value]) => [key, String(value).trim()]),
    );

    const tankRef = db.collection('tanks').doc(String(tankId));
    const tankDoc = await tankRef.get();
    if (!tankDoc.exists || tankDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Tank does not belong to this user.' });
    }

    const fishSnapshot = await tankRef.collection('fish').get();
    const fish = fishSnapshot.docs.map((doc) => {
      const data = doc.data();
      return { name: data.name || data.scientificName || 'Unknown fish', schoolSize: data.schoolSize || '~' };
    });
    let imageUrl = '';
    let imageUploadSkipped = false;
    if (image) {
      if (!process.env.CLOUDINARY_URL) {
        imageUploadSkipped = true;
      } else {
        try {
          const uploaded = await cloudinary.uploader.upload(image, {
            folder: 'aquastainable/water-tests',
            resource_type: 'image',
          });
          imageUrl = uploaded.secure_url || uploaded.url || '';
          imageUploadSkipped = !imageUrl;
        } catch (error) {
          console.error('Water-test image upload error:', error);
          imageUploadSkipped = true;
        }
      }
    }

    const tank = tankDoc.data();
    let review = { waterQuality: '~', summary: 'Water test saved. Review the readings and monitor the tank.', nextWaterChange: '~', model: '' };
    let aiReviewSkipped = false;
    try {
      review = await require('./ai/service').reviewWaterTest({
        tank: { tankName: tank.tankName, tankSize: tank.tankSize, waterType: tank.waterType },
        fish,
        readings: normalizedReadings,
        testedAt,
      });
    } catch (error) {
      console.error('Water-test AI review error:', error);
      aiReviewSkipped = true;
    }
    const waterTest = {
      tankId: String(tankId),
      testedAt,
      readings: normalizedReadings,
      imageUrl,
      waterQuality: review.waterQuality || '~',
      summary: review.summary || '~',
      nextWaterChange: review.nextWaterChange || '~',
      aiModel: review.model || '',
      createdAt: new Date().toISOString(),
    };
    const testRef = await tankRef.collection('waterTests').add(waterTest);
    return res.status(201).json({ id: testRef.id, ...waterTest, imageUploadSkipped, aiReviewSkipped });
  } catch (error) {
    console.error('Water test save error:', error);
    return res.status(502).json({ error: error.message || 'Failed to save water test.' });
  }
});

app.get('/water-tests/tank/:tankId', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database is not configured.' });
    const snapshot = await db.collection('tanks').doc(req.params.tankId).collection('waterTests').get();
    return res.status(200).json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to load water tests.' });
  }
});

async function uploadTankImageToCloudinary(tankImg) {
  if (!tankImg) {
    return '';
  }

  if (tankImg.includes('res.cloudinary.com') || tankImg.includes('cloudinary')) {
    return tankImg;
  }

  if (!process.env.CLOUDINARY_URL) {
    return tankImg;
  }

  try {
    const result = await cloudinary.uploader.upload(tankImg, {
      folder: 'aquastainable/tanks',
      resource_type: 'image',
      use_filename: true,
      unique_filename: false,
    });

    return result.secure_url || result.url || tankImg;
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message || error);
    return tankImg;
  }
}

function normalizeTankPayload(payload = {}) {
  const userId = (payload.user_id || payload.userId || '').toString().trim();
  const tankName = (payload.tankName || payload.name || '').toString().trim();
  const waterType = (payload.waterType || payload.water_type || '').toString().trim();
  const tankImg = (payload.tankImg || payload.tankImage || '').toString().trim();
  const overview = (payload.overview || '').toString();
  const aquaCare = payload.aquaCare || payload.aqua_care || {};
  const tankSize = Number(payload.tankSize ?? payload.tank_size ?? payload.size ?? 0);

  if (!userId) {
    throw new Error('user_id is required to create a tank.');
  }

  if (!tankName) {
    throw new Error('tankName is required.');
  }

  if (!waterType) {
    throw new Error('waterType is required.');
  }

  if (!Number.isFinite(tankSize) || tankSize <= 0) {
    throw new Error('tankSize must be a number greater than 0.');
  }

  const tankId = (payload.tankId || payload.id || randomUUID()).toString();

  return {
    id: tankId,
    tankId,
    user_id: userId,
    tankName,
    tankImg,
    waterType,
    tankSize,
    overview,
    aquaCare,
    createdAt: FieldValue.serverTimestamp(),
  };
}

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

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

app.post('/tanks', async (req, res) => {
  try {
    const tank = normalizeTankPayload(req.body);
    const uploadedImageUrl = await uploadTankImageToCloudinary(tank.tankImg);
    const tankPayload = {
      ...tank,
      tankImg: uploadedImageUrl,
    };
    const tankRef = db.collection('tanks').doc(tankPayload.id);
    await tankRef.set(tankPayload);

    return res.status(201).json({
      ...tankPayload,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Tank create error:', error);
    return res.status(400).json({ error: error.message || 'Failed to create tank.' });
  }
});

app.patch('/tanks/:userId/:tankId', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database is not configured.' });

    const { userId, tankId } = req.params;
    const tankRef = db.collection('tanks').doc(String(tankId));
    const tankDoc = await tankRef.get();
    if (!tankDoc.exists) return res.status(404).json({ error: 'Tank not found.' });
    if (tankDoc.data().user_id !== userId) return res.status(403).json({ error: 'Tank does not belong to this user.' });

    const updates = {};
    if (req.body?.tankName !== undefined) {
      const tankName = String(req.body.tankName).trim();
      if (!tankName) return res.status(400).json({ error: 'tankName is required.' });
      updates.tankName = tankName;
    }
    if (req.body?.tankSize !== undefined) {
      const tankSize = Number(req.body.tankSize);
      if (!Number.isFinite(tankSize) || tankSize <= 0) return res.status(400).json({ error: 'tankSize must be a number greater than 0.' });
      updates.tankSize = tankSize;
    }
    if (req.body?.tankImg !== undefined) {
      updates.tankImg = await uploadTankImageToCloudinary(String(req.body.tankImg || '').trim());
    }
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No tank changes supplied.' });

    await tankRef.update(updates);
    return res.status(200).json({ id: tankDoc.id, ...tankDoc.data(), ...updates });
  } catch (error) {
    console.error('Tank update error:', error);
    return res.status(400).json({ error: error.message || 'Failed to update tank.' });
  }
});

app.delete('/tanks/:userId/:tankId', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database is not configured.' });

    const { userId, tankId } = req.params;
    let tankRef = db.collection('tanks').doc(String(tankId));
    let tankDoc = await tankRef.get();
    if (!tankDoc.exists) {
      const matchingTanks = await db.collection('tanks')
        .where('tankId', '==', String(tankId))
        .get();
      const matchingTank = matchingTanks.docs.find((doc) => doc.data().user_id === userId);
      if (!matchingTank) return res.status(404).json({ error: 'Tank not found.' });
      tankDoc = matchingTank;
      tankRef = tankDoc.ref;
    }
    if (tankDoc.data().user_id !== userId) return res.status(403).json({ error: 'Tank does not belong to this user.' });

    await db.recursiveDelete(tankRef);
    return res.status(204).send();
  } catch (error) {
    console.error('Tank delete error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete tank.' });
  }
});

app.get('/tanks/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const snapshot = await db.collection('tanks').where('user_id', '==', userId).get();

    const tanks = snapshot.docs.map((doc) => ({
      id: doc.id,
      tankId: doc.data().tankId || doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(tanks);
  } catch (error) {
    console.error('Get tanks error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get tanks.' });
  }
});

app.get('/tanks/:userId/:tankId', async (req, res) => {
  try {
    const { tankId, userId } = req.params;
    const tankRef = db.collection('tanks').doc(tankId);
    const tankDoc = await tankRef.get();

    if (!tankDoc.exists) {
      return res.status(404).json({ error: 'Tank not found.' });
    }

    const data = tankDoc.data();
    if (data.user_id !== userId) {
      return res.status(403).json({ error: 'Tank does not belong to this user.' });
    }

    return res.status(200).json({ id: tankDoc.id, tankId: data.tankId || tankDoc.id, ...data });
  } catch (error) {
    console.error('Get tank by id error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get tank.' });
  }
});

app.listen(4000, () => {
  console.log('Backend listening on http://localhost:4000');
});
