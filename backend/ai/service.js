const groqProvider = require('./providers/groqProvider');
const { AQUARIUM_SYSTEM_PROMPT, assistantPrompt, fishDataPrompt, plantDataPrompt } = require('./prompts');

function parseJsonResponse(response) {
  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error('The remote AI returned invalid JSON.');
  }
}

async function generateText(prompt) {
  return groqProvider.generate({
    prompt,
    system: AQUARIUM_SYSTEM_PROMPT,
  });
}

async function generateFishData(species) {
  const result = await groqProvider.generate({
    prompt: fishDataPrompt(species),
    system: AQUARIUM_SYSTEM_PROMPT,
    format: 'json',
  });

  return { ...parseJsonResponse(result.response), model: result.model };
}

async function generatePlantData(plant) {
  const result = await groqProvider.generate({
    prompt: plantDataPrompt(plant),
    system: AQUARIUM_SYSTEM_PROMPT,
    format: 'json',
  });

  return { ...parseJsonResponse(result.response), model: result.model };
}

async function answerAssistant(message, context) {
  const result = await groqProvider.generate({
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
  health: groqProvider.health,
};
