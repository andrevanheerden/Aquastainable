const config = {
  enabled: process.env.AI_ENABLED !== 'false',
  baseUrl: (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, ''),
  model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
  timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 120000),
};

module.exports = config;
