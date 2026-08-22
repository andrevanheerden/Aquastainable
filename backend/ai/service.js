const groqProvider = require('./providers/groqProvider');
const { AQUARIUM_SYSTEM_PROMPT, assistantPrompt, fishDataPrompt, plantDataPrompt, tankOverviewPrompt, fishCompatibilityPrompt } = require('./prompts');

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

async function generateTankOverview(data) {
  const result = await groqProvider.generate({
    prompt: tankOverviewPrompt(data),
    system: AQUARIUM_SYSTEM_PROMPT,
  });

  const overview = result.response.trim().split(/\s+/).slice(0, 150).join(' ');
  return { overview, model: result.model };
}

async function assessFishCompatibility(data) {
  const result = await groqProvider.generate({
    prompt: fishCompatibilityPrompt(data),
    system: AQUARIUM_SYSTEM_PROMPT,
    format: 'json',
  });

  return parseJsonResponse(result.response);
}

module.exports = {
  answerAssistant,
  generateFishData,
  generatePlantData,
  generateText,
  generateTankOverview,
  assessFishCompatibility,
  health: groqProvider.health,
};
