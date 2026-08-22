const express = require('express');
const { searchFish } = require('./service');
const aiService = require('../ai/service');

function rangeText(range, suffix = '') {
  if (!range || range.min === null || range.max === null) return '';
  return `${range.min}-${range.max}${suffix}`;
}

async function getCareProfile(body) {
  const profile = await aiService.generateFishData(body.scientificName || body.name || body.fishId);
  return {
    description: String(profile.careNotes || '').trim(),
    bestTempC: rangeText(profile.temperatureC, '°C'),
    phRange: rangeText(profile.pH),
    waterSpace: profile.minimumTankLitres ? `${profile.minimumTankLitres} L minimum` : '',
    feedType: String(profile.diet || '').trim(),
    adultLengthCm: profile.adultLengthCm ?? null,
    temperament: String(profile.temperament || '').trim(),
    minimumGroupSize: profile.minimumGroupSize ?? null,
    careProfileConfidence: String(profile.confidence || 'low').trim(),
    careProfileModel: String(profile.model || '').trim(),
    careProfileUpdatedAt: new Date(),
  };
}

async function getCareProfileSafely(body) {
  try {
    return await getCareProfile(body);
  } catch (error) {
    console.warn('Fish care profile unavailable:', error.message || error);
    return {};
  }
}

function compactRecord(doc) {
  const record = { id: doc.id, ...doc.data() };
  for (const key of ['image', 'tankImg', 'imageData', 'base64', 'imageSourceUrl', 'imageLicense']) {
    delete record[key];
  }
  return record;
}

async function getTankContexts(db, userId) {
  const tanksSnapshot = await db.collection('tanks').where('user_id', '==', userId).get();
  return Promise.all(tanksSnapshot.docs.map(async (tankDoc) => {
    const tankData = { id: tankDoc.id, ...tankDoc.data() };
    delete tankData.overview;
    delete tankData.overviewDataFingerprint;
    delete tankData.overviewUpdatedAt;
    delete tankData.tankImg;
    const [fishSnapshot, plantsSnapshot, waterTestsSnapshot, legacyWaterTestsSnapshot] = await Promise.all([
      tankDoc.ref.collection('fish').get(),
      tankDoc.ref.collection('plants').get(),
      tankDoc.ref.collection('waterTests').get(),
      tankDoc.ref.collection('water_tests').get(),
    ]);
    const records = (snapshot) => snapshot.docs.map(compactRecord).sort((left, right) => left.id.localeCompare(right.id));
    return {
      id: tankData.tankId || tankDoc.id,
      name: tankData.tankName || 'Unnamed tank',
      tank: tankData,
      fish: records(fishSnapshot),
      plants: records(plantsSnapshot),
      waterTests: [...records(waterTestsSnapshot), ...records(legacyWaterTestsSnapshot)]
        .sort((left, right) => left.id.localeCompare(right.id)),
    };
  }));
}

function fishInput(body) {
  return {
    id: body.fishId,
    name: body.name || '',
    scientificName: body.scientificName || '',
    schoolSize: body.schoolSize,
  };
}

function firstNumber(value) {
  const match = String(value || '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function maximumNumber(value) {
  const matches = String(value || '').match(/\d+(?:\.\d+)?/g);
  return matches?.length ? Number(matches[matches.length - 1]) : null;
}

function normalizeAssessment(assessment, requestedSchoolSize) {
  const requested = firstNumber(requestedSchoolSize);
  const optimal = firstNumber(assessment.optimalSchoolSize);
  const maximum = maximumNumber(assessment.maximumSchoolSize);
  const explanation = String(assessment.explanation || '').trim();
  const hasBlockingIssue = /(ammonia|nitrite|chlorine|chloramine|overstock|incompatible|aggression|unsafe|danger|too small|cannot add)/i.test(explanation);

  if (requested !== null && maximum !== null && requested <= maximum && !hasBlockingIssue) {
    const comparison = optimal !== null && requested < optimal
      ? `This group of ${requested} will work for this tank, but ${assessment.optimalSchoolSize} is the better group size.`
      : `This is a good school size for this tank. The recommended range is ${assessment.optimalSchoolSize || requested}.`;
    return { ...assessment, canAdd: true, status: 'compatible', explanation: comparison };
  }

  return { ...assessment, canAdd: assessment.canAdd === true || assessment.status === 'compatible', explanation };
}

async function assessAddition(db, body) {
  const contexts = await getTankContexts(db, body.userId);
  const selectedTank = contexts.find((item) => item.id === String(body.tankId));
  if (!selectedTank) {
    const error = new Error('Tank does not belong to this user.');
    error.statusCode = 403;
    throw error;
  }
  const assessment = await aiService.assessFishCompatibility({
    fish: fishInput(body),
    schoolSize: body.schoolSize,
    selectedTank,
    otherTanks: contexts.filter((item) => item.id !== selectedTank.id),
  });
  const normalizedAssessment = normalizeAssessment(assessment, body.schoolSize);
  const explanation = String(normalizedAssessment.explanation || '').trim().split(/\s+/).slice(0, 50).join(' ');
  return {
    ...normalizedAssessment,
    canAdd: normalizedAssessment.canAdd === true || normalizedAssessment.status === 'compatible',
    explanation,
    selectedTankId: selectedTank.id,
    selectedTankName: selectedTank.name,
    suggestedTankId: assessment.suggestedTankId || null,
    suggestedTankName: assessment.suggestedTankName || '',
  };
}

function createFishRouter({ db }) {
  const router = express.Router();

  router.post('/assess-add', async (req, res) => {
    try {
      const { userId, tankId, fishId, schoolSize } = req.body || {};
      if (!userId || !tankId || !fishId) {
        return res.status(400).json({ error: 'userId, tankId, and fishId are required.' });
      }
      return res.status(200).json(await assessAddition(db, req.body));
    } catch (error) {
      console.error('Fish compatibility error:', error);
      return res.status(error.statusCode || 502).json({ error: error.message || 'Fish compatibility review failed.' });
    }
  });

  router.post('/add-reviewed', async (req, res) => {
    try {
      const { userId, tankId, fishId, schoolSize } = req.body || {};
      if (!userId || !tankId || !fishId || !String(schoolSize || '').trim()) {
        return res.status(400).json({ error: 'userId, tankId, fishId, and schoolSize are required.' });
      }
      const assessment = await assessAddition(db, req.body);
      if (!assessment.canAdd) {
        return res.status(409).json({ error: assessment.explanation || 'This fish cannot be added to this tank.', assessment });
      }

      const fishRecord = {
        fishId,
        tankId,
        name: req.body.name || '',
        scientificName: req.body.scientificName || '',
        imageName: req.body.imageName || '',
        image: req.body.image || '',
        imageSourceUrl: req.body.imageSourceUrl || '',
        imageLicense: req.body.imageLicense || '',
        source: req.body.source || '',
        schoolSize,
        addedAt: new Date(),
        ...(await getCareProfileSafely(req.body)),
      };
      const docRef = await db.collection('tanks').doc(String(tankId)).collection('fish').add(fishRecord);
      return res.status(201).json({ id: docRef.id, ...fishRecord, assessment });
    } catch (error) {
      console.error('Reviewed fish add error:', error);
      return res.status(error.statusCode || 502).json({ error: error.message || 'Reviewed fish add failed.' });
    }
  });

  router.get('/search', async (req, res) => {
    try {
      const results = await searchFish(req.query.query);
      return res.json(results);
    } catch (error) {
      console.error('Fish search error:', error);
      return res.status(502).json({ error: error.message || 'Fish species API is unavailable.' });
    }
  });

  router.post('/enrich/:fishId', async (req, res) => {
    try {
      const { userId } = req.body || {};
      if (!db) return res.status(503).json({ error: 'Database is not configured.' });
      if (!userId) return res.status(400).json({ error: 'userId is required.' });

      const tanksSnapshot = await db.collection('tanks').where('user_id', '==', userId).get();
      const matchingDocs = [];
      for (const tankDoc of tanksSnapshot.docs) {
        const fishSnapshot = await tankDoc.ref.collection('fish').where('fishId', '==', String(req.params.fishId)).get();
        fishSnapshot.docs.forEach((fishDoc) => matchingDocs.push(fishDoc));
      }
      if (!matchingDocs.length) return res.status(404).json({ error: 'Fish was not found for this user.' });

      const source = matchingDocs[0].data();
      const careProfile = await getCareProfile({ ...source, fishId: req.params.fishId });
      await Promise.all(matchingDocs.map((fishDoc) => fishDoc.ref.update(careProfile)));
      return res.status(200).json({ updated: matchingDocs.length, ...careProfile });
    } catch (error) {
      console.error('Fish enrichment error:', error);
      return res.status(502).json({ error: error.message || 'Fish care data could not be loaded.' });
    }
  });

  router.post('/add', async (req, res) => {
    try {
      const { userId, tankId, fishId, name, scientificName, imageName, image, imageSourceUrl, imageLicense, source, schoolSize } = req.body;

      if (!userId || !tankId || !fishId || !schoolSize) {
        return res.status(400).json({ error: 'userId, tankId, fishId, and schoolSize are required.' });
      }

      const assessment = await assessAddition(db, req.body);
      if (!assessment.canAdd) {
        return res.status(409).json({ error: assessment.explanation || 'This fish cannot be added to this tank.', assessment });
      }

      const tankDoc = await db.collection('tanks').doc(tankId).get();
      if (!tankDoc.exists || tankDoc.data().user_id !== userId) {
        return res.status(403).json({ error: 'Tank does not belong to this user.' });
      }

      const fishRecord = {
        fishId,
        tankId,
        name: name || '',
        scientificName: scientificName || '',
        imageName: imageName || '',
        image: image || '',
        imageSourceUrl: imageSourceUrl || '',
        imageLicense: imageLicense || '',
        source: source || '',
        schoolSize,
        addedAt: new Date(),
        ...(await getCareProfileSafely(req.body)),
      };

      const docRef = await db.collection('tanks').doc(tankId).collection('fish').add(fishRecord);
      return res.status(201).json({ id: docRef.id, ...fishRecord });
    } catch (error) {
      console.error('Add fish error:', error);
      return res.status(500).json({ error: error.message || 'Failed to add fish.' });
    }
  });

  router.get('/user/:userId', async (req, res) => {
    try {
      const tanksSnapshot = await db.collection('tanks').where('user_id', '==', req.params.userId).get();
      const fishByTank = await Promise.all(tanksSnapshot.docs.map(async (tankDoc) => {
        const tankData = tankDoc.data();
        const fishSnapshot = await tankDoc.ref.collection('fish').get();

        return fishSnapshot.docs.map((fishDoc) => ({
          id: fishDoc.id,
          tankId: tankData.tankId || tankDoc.id,
          tankName: tankData.tankName || 'Unnamed tank',
          ...fishDoc.data(),
        }));
      }));

      return res.status(200).json(fishByTank.flat());
    } catch (error) {
      console.error('Get user fish error:', error);
      return res.status(500).json({ error: error.message || 'Failed to get fish.' });
    }
  });

  router.get('/tank/:tankId', async (req, res) => {
    try {
      const snapshot = await db.collection('tanks').doc(req.params.tankId).collection('fish').get();
      return res.status(200).json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Get tank fish error:', error);
      return res.status(500).json({ error: error.message || 'Failed to get fish.' });
    }
  });

  // DELETE endpoint updated with user ownership verification
  router.delete('/:tankId/:fishDocId', async (req, res) => {
    try {
      const { userId } = req.body; // or req.user.id from auth middleware
      const { tankId, fishDocId } = req.params;

      const tankDoc = await db.collection('tanks').doc(tankId).get();
      if (!tankDoc.exists || tankDoc.data().user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized to modify this tank.' });
      }

      await db.collection('tanks').doc(tankId).collection('fish').doc(fishDocId).delete();
      return res.status(200).json({ success: true, message: 'Fish removed.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createFishRouter;