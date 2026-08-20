const ollamaProvider = require('./providers/ollamaProvider');
const { AQUARIUM_SYSTEM_PROMPT, assistantPrompt, fishDataPrompt, plantDataPrompt } = require('./prompts');

function parseJsonResponse(response) {
  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error('The local AI returned invalid JSON.');
  }
}

async function generateText(prompt) {
  return ollamaProvider.generate({
    prompt,
    system: AQUARIUM_SYSTEM_PROMPT,
  });
}

async function generateFishData(species) {
  const result = await ollamaProvider.generate({
    prompt: fishDataPrompt(species),
    system: AQUARIUM_SYSTEM_PROMPT,
    format: 'json',
  });

  return { ...parseJsonResponse(result.response), model: result.model };
}

async function generatePlantData(plant) {
  const result = await ollamaProvider.generate({
    prompt: plantDataPrompt(plant),
    system: AQUARIUM_SYSTEM_PROMPT,
    format: 'json',
  });

  return { ...parseJsonResponse(result.response), model: result.model };
}

async function answerAssistant(message, context) {
  const result = await ollamaProvider.generate({
    prompt: assistantPrompt(message, context),
    system: AQUARIUM_SYSTEM_PROMPT,
  });

  return { answer: result.response, model: result.model };
}

module.exports = {
  answerAssistant,
  generateFishData,
  generatePlantData,
  generateText,
  health: ollamaProvider.health,
};
