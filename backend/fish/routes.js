const express = require('express');
const { searchFish } = require('./service');

function createFishRouter({ db }) {
  const router = express.Router();

  router.get('/search', async (req, res) => {
    try {
      const results = await searchFish(req.query.query);
      return res.json(results);
    } catch (error) {
      console.error('Fish search error:', error);
      return res.status(502).json({ error: error.message || 'Fish species API is unavailable.' });
    }
  });

  router.post('/add', async (req, res) => {
    try {
      const { userId, tankId, fishId, name, scientificName, imageName, image, imageSourceUrl, imageLicense, source, schoolSize } = req.body;

      if (!userId || !tankId || !fishId || !schoolSize) {
        return res.status(400).json({ error: 'userId, tankId, fishId, and schoolSize are required.' });
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