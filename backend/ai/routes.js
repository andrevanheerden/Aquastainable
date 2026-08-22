const express = require('express');
const aiService = require('./service');

function createAiRouter() {
  const router = express.Router();

  router.get('/health', async (req, res) => {
    return res.status(200).json(await aiService.health());
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

      return res.status(200).json(await aiService.answerAssistant(message, req.body?.context || {}));
    } catch (error) {
      console.error('AI assistant error:', error);
      return res.status(502).json({ error: error.message || 'Remote AI is unavailable.' });
    }
  });

  return router;
}

module.exports = createAiRouter;
