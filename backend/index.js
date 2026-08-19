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

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true, cloudinary_url: process.env.CLOUDINARY_URL });
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

// Fish Species Endpoints

function normalizeFishResult(item, index = 0) {
  const commonName = item?.name || item?.common_name || item?.commonName || item?.title || `Fish ${index + 1}`;
  const scientificName = item?.scientific_name || item?.scientificName || item?.scientific_name_full || item?.Species || commonName;
  const image = item?.image_url || item?.imageUrl || item?.thumbnail?.source || item?.originalimage?.source || item?.image || item?.img || '';

  return {
    id: item?.id || `${commonName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name: commonName,
    scientificName,
    image,
    schoolSize: item?.schoolSize || item?.school_size || 'User-set',
    tempC: item?.tempC || item?.temp_celsius || item?.temperature || '',
    pH: item?.pH || item?.ph || '',
  };
}

async function searchFishSpecies(query) {
  try {
    const searchTerm = String(query || '').trim();
    if (!searchTerm) return [];

    const endpoints = [
      `https://fishbase.se/libs/jquery/autocomplete/ac_species.php?term=${encodeURIComponent(searchTerm)}`,
      `https://fishbase.se/search.php?search=${encodeURIComponent(searchTerm)}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, { timeout: 20000 });
        const rawText = String(response?.data || '').trim();
        if (!rawText) continue;

        const arrayMatches = [...rawText.matchAll(/\[[\s\S]*?\]/g)];
        const lastArray = arrayMatches[arrayMatches.length - 1]?.[0];

        let parsedResults = [];
        if (lastArray) {
          try {
            const parsed = JSON.parse(lastArray);
            if (Array.isArray(parsed)) {
              parsedResults = parsed;
            }
          } catch (error) {
            parsedResults = [];
          }
        }

        if (!Array.isArray(parsedResults) || parsedResults.length === 0) {
          const htmlNames = [...rawText.matchAll(/(?:value|title|label|alt|data-name)\s*=\s*['"]([^'"]+)['"]/gi)]
            .map((match) => match[1].replace(/<[^>]+>/g, '').trim())
            .filter(Boolean)
            .map((name) => name.replace(/\s+/g, ' '));

          const deduped = [...new Set(htmlNames.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase())))];
          if (deduped.length > 0) {
            parsedResults = deduped;
          }
        }

        if (Array.isArray(parsedResults) && parsedResults.length > 0) {
          const cleanNames = parsedResults
            .map((entry) => typeof entry === 'string' ? entry : (entry?.label || entry?.name || entry?.value || ''))
            .map((name) => String(name).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
            .filter((name) => !!name && name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter((name, index, arr) => arr.indexOf(name) === index)
            .slice(0, 5);

          if (cleanNames.length > 0) {
            return cleanNames.map((name, index) => ({
              id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
              name,
              scientificName: name,
              image: '',
              schoolSize: 'User-set',
              tempC: '',
              pH: '',
            }));
          }
        }
      } catch (endpointError) {
        // try the next source
      }
    }

    return [];
  } catch (error) {
    console.error('FishBase search failed:', error.message || error);
    return [];
  }
}

// Search fish species by name (uses Kaggle API)
app.get('/fish/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const searchTerm = query.toLowerCase().trim();
    const results = await searchFishSpecies(searchTerm);

    return res.status(200).json(results || []);
  } catch (error) {
    console.error('Fish search error:', error);
    return res.status(500).json({ error: error.message || 'Failed to search fish.' });
  }
});

// Add fish species to tank
app.post('/fish/add', async (req, res) => {
  try {
    const { userId, tankId, fishId, name, scientificName, image, schoolSize } = req.body;

    if (!userId || !tankId || !fishId || !schoolSize) {
      return res.status(400).json({ error: 'userId, tankId, fishId, and schoolSize are required.' });
    }

    // Verify tank belongs to user
    const tankDoc = await db.collection('tanks').doc(tankId).get();
    if (!tankDoc.exists || tankDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Tank does not belong to this user.' });
    }

    // Add fish species to tank's fish subcollection with user-provided data
    const fishRecord = {
      fishId,
      tankId,
      name: name || 'Unknown Species',
      scientificName: scientificName || '',
      image: image || '',
      schoolSize,
      addedAt: new Date(),
    };

    const docRef = await db.collection('tanks').doc(tankId).collection('fish').add(fishRecord);

    return res.status(201).json({
      id: docRef.id,
      ...fishRecord,
    });
  } catch (error) {
    console.error('Add fish error:', error);
    return res.status(500).json({ error: error.message || 'Failed to add fish.' });
  }
});

// Get fish species for a tank
app.get('/fish/tank/:tankId', async (req, res) => {
  try {
    const { tankId } = req.params;

    // Get all fish in tank's fish subcollection
    const fishSnapshot = await db.collection('tanks').doc(tankId).collection('fish').get();

    const fish = fishSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(fish);
  } catch (error) {
    console.error('Get tank fish error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get fish.' });
  }
});

// Remove fish species from tank
app.delete('/fish/:tankId/:fishDocId', async (req, res) => {
  try {
    const { tankId, fishDocId } = req.params;

    await db.collection('tanks').doc(tankId).collection('fish').doc(fishDocId).delete();

    return res.status(200).json({ success: true, message: 'Fish removed from tank.' });
  } catch (error) {
    console.error('Remove fish error:', error);
    return res.status(500).json({ error: error.message || 'Failed to remove fish.' });
  }
});

app.listen(4000, () => {
  console.log('Backend listening on http://localhost:4000');
});
