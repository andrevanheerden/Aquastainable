const express = require('express');
const { searchFish } = require('./rapidApi');

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