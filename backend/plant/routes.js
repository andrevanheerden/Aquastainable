const express = require('express');
const { searchPlants } = require('./service');

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
      };
      const plantRef = await tankRef.collection('plants').add(plantRecord);
      return res.status(201).json({ id: plantRef.id, tankName: tankDoc.data().tankName || 'Unnamed tank', ...plantRecord });
    } catch (error) {
      console.error('Plant add error:', error);
      return res.status(500).json({ error: error.message || 'Failed to add plant.' });
    }
  });

  return router;
}

module.exports = createPlantRouter;
