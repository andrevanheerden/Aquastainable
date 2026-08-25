const express = require('express');
const { searchPlants } = require('./service');
const aiService = require('../ai/service');

function rangeText(range, suffix = '') {
  if (!range || range.min === null || range.max === null) return '';
  return `${range.min}-${range.max}${suffix}`;
}

async function getPlantCareProfile(name, scientificName) {
  try {
    const profile = await aiService.generatePlantData(scientificName || name);
    return {
      description: String(profile.careNotes || '').trim(),
      bestTempC: rangeText(profile.temperatureC, '°C'),
      phRange: rangeText(profile.pH),
      light: String(profile.light || 'unknown').trim(),
      growthRate: String(profile.growthRate || 'unknown').trim(),
      placement: String(profile.placement || '').trim(),
      careProfileConfidence: String(profile.confidence || 'low').trim(),
      careProfileModel: String(profile.model || '').trim(),
      careProfileUpdatedAt: new Date(),
    };
  } catch (error) {
    console.warn('Plant care profile unavailable:', error.message || error);
    return {};
  }
}

function compactAquariumRecord(doc) {
  const record = { id: doc.id, ...doc.data() };
  for (const key of ['image', 'imageData', 'base64', 'imageSourceUrl', 'imageLicense', 'source']) {
    delete record[key];
  }
  return record;
}

async function getTankContext(db, userId, tankId) {
  const tankRef = db.collection('tanks').doc(String(tankId));
  const tankDoc = await tankRef.get();
  if (!tankDoc.exists || tankDoc.data().user_id !== userId) {
    const error = new Error('Tank does not belong to this user.');
    error.statusCode = 403;
    throw error;
  }

  const [fishSnapshot, plantsSnapshot, waterTestsSnapshot] = await Promise.all([
    tankRef.collection('fish').get(),
    tankRef.collection('plants').get(),
    tankRef.collection('waterTests').get(),
  ]);
  const toRecords = (snapshot) => snapshot.docs.map(compactAquariumRecord);
  const tankData = { ...tankDoc.data() };
  for (const key of ['tankImg', 'image', 'imageData', 'base64']) {
    delete tankData[key];
  }
  return {
    id: String(tankDoc.data().tankId || tankId),
    name: tankDoc.data().tankName || 'Unnamed tank',
    tank: tankData,
    fish: toRecords(fishSnapshot),
    plants: toRecords(plantsSnapshot),
    waterTests: toRecords(waterTestsSnapshot),
  };
}

function createPlantRouter({ db }) {
  const router = express.Router();

  router.get('/search', async (req, res) => {
    try {
      return res.status(200).json(await searchPlants(req.query.query));
    } catch (error) {
      console.error('Plant search error:', error);
      return res.status(502).json({ error: error.message || 'Plant species API is unavailable.' });
    }
  });

  router.post('/assess-add', async (req, res) => {
    try {
      const { userId, tankId, plant } = req.body || {};
      if (!db) return res.status(503).json({ error: 'Database is not configured.' });
      if (!userId || !tankId || !plant?.name) {
        return res.status(400).json({ error: 'userId, tankId, and plant are required.' });
      }

      const tanksSnapshot = await db.collection('tanks').where('user_id', '==', userId).get();
      const contexts = await Promise.all(tanksSnapshot.docs.map((doc) => getTankContext(db, userId, doc.id)));
      const selectedTank = contexts.find((context) => context.id === String(tankId));
      if (!selectedTank) return res.status(403).json({ error: 'Tank does not belong to this user.' });

      const assessment = await require('../ai/service').assessPlantCompatibility({
        plant,
        selectedTank,
        otherTanks: contexts.filter((context) => context.id !== selectedTank.id),
      });
      return res.status(200).json({
        canAdd: assessment.canAdd === true,
        status: assessment.status || (assessment.canAdd ? 'compatible' : 'incompatible'),
        title: assessment.title || (assessment.canAdd ? 'Plant is compatible' : 'Plant needs a different setup'),
        explanation: String(assessment.explanation || '').trim().split(/\s+/).slice(0, 50).join(' '),
        suggestedPlantName: String(assessment.suggestedPlantName || '').trim(),
        model: assessment.model || '',
      });
    } catch (error) {
      console.error('Plant compatibility error:', error);
      return res.status(error.statusCode || 502).json({ error: error.message || 'Plant compatibility review failed.' });
    }
  });

  router.post('/add', async (req, res) => {
    try {
      const { userId, tankId, plantId, name, scientificName, image, imageSourceUrl, imageLicense, source } = req.body || {};
      if (!db) return res.status(503).json({ error: 'Database is not configured.' });
      if (!userId || !tankId || !plantId || !name || !scientificName) {
        return res.status(400).json({ error: 'userId, tankId, plantId, name, and scientificName are required.' });
      }

      const tankRef = db.collection('tanks').doc(String(tankId));
      const tankDoc = await tankRef.get();
      if (!tankDoc.exists || tankDoc.data().user_id !== userId) {
        return res.status(403).json({ error: 'Tank does not belong to this user.' });
      }

      const plantRecord = {
        plantId: String(plantId),
        tankId: String(tankId),
        name: String(name).trim(),
        scientificName: String(scientificName).trim(),
        image: image || '',
        imageSourceUrl: imageSourceUrl || '',
        imageLicense: imageLicense || '',
        source: source || '',
        addedAt: new Date(),
        ...(await getPlantCareProfile(name, scientificName)),
      };
      const plantRef = await tankRef.collection('plants').add(plantRecord);
      return res.status(201).json({ id: plantRef.id, tankName: tankDoc.data().tankName || 'Unnamed tank', ...plantRecord });
    } catch (error) {
      console.error('Plant add error:', error);
      return res.status(500).json({ error: error.message || 'Failed to add plant.' });
    }
  });

  router.get('/user/:userId', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database is not configured.' });
      const tanksSnapshot = await db.collection('tanks').where('user_id', '==', req.params.userId).get();
      const plantsByTank = await Promise.all(tanksSnapshot.docs.map(async (tankDoc) => {
        const tankData = tankDoc.data();
        const plantsSnapshot = await tankDoc.ref.collection('plants').get();
        return plantsSnapshot.docs.map((plantDoc) => ({
          id: plantDoc.id,
          tankId: tankData.tankId || tankDoc.id,
          tankName: tankData.tankName || 'Unnamed tank',
          ...plantDoc.data(),
        }));
      }));
      return res.status(200).json(plantsByTank.flat());
    } catch (error) {
      console.error('Get user plants error:', error);
      return res.status(500).json({ error: error.message || 'Failed to get plants.' });
    }
  });

  router.delete('/:tankId/:plantDocId', async (req, res) => {
    try {
      const { userId } = req.body || {};
      const tankRef = db.collection('tanks').doc(String(req.params.tankId));
      const tankDoc = await tankRef.get();
      if (!tankDoc.exists || tankDoc.data().user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized to modify this tank.' });
      }
      const plantRef = tankRef.collection('plants').doc(String(req.params.plantDocId));
      const plantDoc = await plantRef.get();
      if (!plantDoc.exists) return res.status(404).json({ error: 'Plant was not found.' });
      await plantRef.delete();
      return res.status(200).json({ success: true, message: 'Plant removed.' });
    } catch (error) {
      console.error('Plant delete error:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete plant.' });
    }
  });

  return router;
}

module.exports = createPlantRouter;
