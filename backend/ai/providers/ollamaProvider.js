const axios = require('axios');
const config = require('../config');

async function generate({ prompt, system, format }) {
  if (!config.enabled) {
    throw new Error('Local AI is disabled. Set AI_ENABLED=true in backend/.env.');
  }

  const response = await axios.post(
    `${config.baseUrl}/api/generate`,
    {
      model: config.model,
      prompt,
      system,
      format,
      stream: false,
      options: {
        temperature: 0.2,
      },
    },
    { timeout: config.timeoutMs }
  );

  return {
    model: response.data?.model || config.model,
    response: response.data?.response || '',
    totalDuration: response.data?.total_duration,
    promptEvalCount: response.data?.prompt_eval_count,
    evalCount: response.data?.eval_count,
  };
}

async function health() {
  try {
    const response = await axios.get(`${config.baseUrl}/api/tags`, { timeout: 5000 });
    const models = Array.isArray(response.data?.models) ? response.data.models : [];
    return {
      enabled: config.enabled,
      reachable: true,
      model: config.model,
      installed: models.some((item) => item.name === config.model),
      models: models.map((item) => item.name),
    };
  } catch (error) {
    return {
      enabled: config.enabled,
      reachable: false,
      model: config.model,
      installed: false,
      error: error.code || error.message,
    };
  }
}

module.exports = { generate, health };
