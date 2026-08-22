const config = {
  enabled: process.env.AI_ENABLED !== 'false',
  apiKey: process.env.GROQ_API_KEY || '',
  baseUrl: (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, ''),
  model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  timeoutMs: Number(process.env.GROQ_TIMEOUT_MS || 120000),
};

module.exports = config;
