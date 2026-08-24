const express = require('express');
const aiService = require('./service');

function createAiRouter({ db } = {}) {
  const router = express.Router();

  const chatsCollection = (userId) => db.collection('users').doc(String(userId)).collection('Chats');

  router.get('/assistant/chats', async (req, res) => {
    try {
      const userId = String(req.query.userId || '').trim();
      if (!userId || !db) return res.status(400).json({ error: 'userId is required.' });
      const snapshot = await chatsCollection(userId).orderBy('updatedAt', 'desc').get();
      return res.status(200).json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Unable to load chats.' });
    }
  });

  router.get('/assistant/chats/:chatId', async (req, res) => {
    try {
      const userId = String(req.query.userId || '').trim();
      if (!userId || !db) return res.status(400).json({ error: 'userId is required.' });
      const chatRef = chatsCollection(userId).doc(req.params.chatId);
      const chatDoc = await chatRef.get();
      if (!chatDoc.exists) return res.status(404).json({ error: 'Chat not found.' });
      const messages = await chatRef.collection('messages').orderBy('createdAt', 'asc').get();
      return res.status(200).json({ id: chatDoc.id, ...chatDoc.data(), messages: messages.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Unable to load chat.' });
    }
  });

  router.delete('/assistant/chats/:chatId', async (req, res) => {
    try {
      const userId = String(req.query.userId || '').trim();
      if (!userId) return res.status(400).json({ error: 'userId is required.' });
      if (!db) return res.status(503).json({ error: 'Chat storage is unavailable until the database is configured.' });

      const chatRef = chatsCollection(userId).doc(req.params.chatId);
      const chatDoc = await chatRef.get();
      if (!chatDoc.exists) return res.status(404).json({ error: 'Chat not found.' });

      const messages = await chatRef.collection('messages').get();
      for (let index = 0; index < messages.docs.length; index += 450) {
        const batch = db.batch();
        messages.docs.slice(index, index + 450).forEach((message) => batch.delete(message.ref));
        await batch.commit();
      }
      await chatRef.delete();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Unable to delete chat.' });
    }
  });

  router.get('/health', async (req, res) => {
    return res.status(200).json(await aiService.health());
  });

  router.post('/tank-overview', async (req, res) => {
    try {
      const { userId, tankId } = req.body || {};
      if (!userId || !tankId) {
        return res.status(400).json({ error: 'userId and tankId are required.' });
      }
      if (!db) {
        return res.status(503).json({ error: 'Tank data is unavailable until the database is configured.' });
      }

      const tankRef = db.collection('tanks').doc(String(tankId));
      const tankDoc = await tankRef.get();
      if (!tankDoc.exists || tankDoc.data().user_id !== userId) {
        return res.status(403).json({ error: 'Tank does not belong to this user.' });
      }

      const [fishSnapshot, plantsSnapshot, waterTestsSnapshot, waterTestsLegacySnapshot] = await Promise.all([
        tankRef.collection('fish').get(),
        tankRef.collection('plants').get(),
        tankRef.collection('waterTests').get(),
        tankRef.collection('water_tests').get(),
      ]);
      const toOverviewRecord = (doc) => {
        const record = { id: doc.id, ...doc.data() };
        for (const key of ['image', 'tankImg', 'imageData', 'base64', 'imageSourceUrl', 'imageLicense']) {
          delete record[key];
        }
        return record;
      };
      const toRecords = (snapshot) => snapshot.docs
        .map(toOverviewRecord)
        .sort((left, right) => left.id.localeCompare(right.id));
      const fish = toRecords(fishSnapshot);
      const plants = toRecords(plantsSnapshot);
      const waterTests = [...toRecords(waterTestsSnapshot), ...toRecords(waterTestsLegacySnapshot)]
        .sort((left, right) => left.id.localeCompare(right.id));
      const tank = { id: tankDoc.id, ...tankDoc.data() };
      const tankSourceData = { ...tank };
      delete tankSourceData.tankImg;
      delete tankSourceData.overview;
      delete tankSourceData.overviewDataFingerprint;
      delete tankSourceData.overviewUpdatedAt;
      const sourceData = { tank: tankSourceData, fish, plants, waterTests };
      const fingerprint = JSON.stringify({ tank: tankSourceData, fish, plants, waterTests });
      const stored = tankDoc.data();

      if (stored.overview && stored.overviewDataFingerprint === fingerprint) {
        return res.status(200).json({ overview: stored.overview, generated: false });
      }

      const generated = await aiService.generateTankOverview(sourceData);
      await tankRef.update({
        overview: generated.overview,
        overviewDataFingerprint: fingerprint,
        overviewUpdatedAt: new Date().toISOString(),
      });

      return res.status(200).json({ ...generated, generated: true });
    } catch (error) {
      console.error('Tank overview error:', error);
      return res.status(502).json({ error: error.message || 'Remote AI is unavailable.' });
    }
  });

  router.post('/generate', async (req, res) => {
    try {
      const prompt = String(req.body?.prompt || '').trim();
      if (!prompt) {
        return res.status(400).json({ error: 'prompt is required.' });
      }

      return res.status(200).json(await aiService.generateText(prompt));
    } catch (error) {
      console.error('AI generation error:', error);
      return res.status(502).json({ error: error.message || 'Remote AI is unavailable.' });
    }
  });

  router.post('/fish-data', async (req, res) => {
    try {
      const species = String(req.body?.species || '').trim();
      if (!species) {
        return res.status(400).json({ error: 'species is required.' });
      }

      return res.status(200).json(await aiService.generateFishData(species));
    } catch (error) {
      console.error('AI fish data error:', error);
      return res.status(502).json({ error: error.message || 'Remote AI is unavailable.' });
    }
  });

  router.post('/plant-data', async (req, res) => {
    try {
      const plant = String(req.body?.plant || '').trim();
      if (!plant) {
        return res.status(400).json({ error: 'plant is required.' });
      }

      return res.status(200).json(await aiService.generatePlantData(plant));
    } catch (error) {
      console.error('AI plant data error:', error);
      return res.status(502).json({ error: error.message || 'Remote AI is unavailable.' });
    }
  });

  router.post('/assistant', async (req, res) => {
    try {
      const message = String(req.body?.message || '').trim();
      if (!message) {
        return res.status(400).json({ error: 'message is required.' });
      }
      const userId = String(req.body?.userId || '').trim();
      const context = req.body?.context || {};
      const history = Array.isArray(req.body?.history) ? req.body.history.slice(-20) : [];
      const result = await aiService.answerAssistant(message, context, history);

      if (db && userId) {
        const chats = chatsCollection(userId);
        const chatRef = req.body?.chatId ? chats.doc(String(req.body.chatId)) : chats.doc();
        const chatDoc = await chatRef.get();
        const now = new Date().toISOString();
        if (!chatDoc.exists) {
          await chatRef.set({ title: message.slice(0, 60), createdAt: now, updatedAt: now });
        } else {
          await chatRef.update({ updatedAt: now });
        }
        const messageRef = chatRef.collection('messages').doc();
        await messageRef.set({ question: message, answer: result.answer, context, createdAt: now });
        return res.status(200).json({ ...result, chatId: chatRef.id, messageId: messageRef.id });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('AI assistant error:', error);
      return res.status(502).json({ error: error.message || 'Remote AI is unavailable.' });
    }
  });

  return router;
}

module.exports = createAiRouter;
