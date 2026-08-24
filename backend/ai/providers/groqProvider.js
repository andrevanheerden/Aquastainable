const axios = require('axios');
const config = require('../config');

function getHeaders() {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
}

function ensureConfigured() {
  if (!config.enabled) {
    throw new Error('Remote AI is disabled. Set AI_ENABLED=true in backend/.env.');
  }

  if (!config.apiKey) {
    throw new Error('GROQ_API_KEY is missing. Add your Groq API key to backend/.env.');
  }
}

async function generate({ prompt, system, format, history = [], maxTokens }) {
  ensureConfigured();

  const response = await axios.post(
    `${config.baseUrl}/chat/completions`,
    {
      model: config.model,
      messages: [
        { role: 'system', content: system || '' },
        ...history.filter((message) => message && (message.role === 'user' || message.role === 'assistant')),
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
      ...(format === 'json' ? { response_format: { type: 'json_object' } } : {}),
    },
    { headers: getHeaders(), timeout: config.timeoutMs }
  );

  return {
    model: response.data?.model || config.model,
    response: response.data?.choices?.[0]?.message?.content || '',
    promptTokens: response.data?.usage?.prompt_tokens,
    completionTokens: response.data?.usage?.completion_tokens,
  };
}

async function health() {
  if (!config.enabled) {
    return { enabled: false, configured: Boolean(config.apiKey), model: config.model };
  }

  if (!config.apiKey) {
    return {
      enabled: true,
      configured: false,
      reachable: false,
      model: config.model,
      error: 'GROQ_API_KEY is missing',
    };
  }

  try {
    const response = await axios.get(`${config.baseUrl}/models`, {
      headers: getHeaders(),
      timeout: 5000,
    });
    const models = Array.isArray(response.data?.data) ? response.data.data : [];

    return {
      enabled: true,
      configured: true,
      reachable: true,
      model: config.model,
      installed: models.some((item) => item.id === config.model),
      models: models.map((item) => item.id),
    };
  } catch (error) {
    return {
      enabled: true,
      configured: true,
      reachable: false,
      model: config.model,
      installed: false,
      error: error.response?.data?.error?.message || error.code || error.message,
    };
  }
}

module.exports = { generate, health };