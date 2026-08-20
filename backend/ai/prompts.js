const AQUARIUM_SYSTEM_PROMPT = `You are Aquastainable's aquarium assistant.
Give conservative, practical freshwater aquarium guidance.
Never invent certainty. If information is missing or species-specific facts are uncertain, say so.
Return only the requested format.`;

function fishDataPrompt(species) {
  return `Create a freshwater aquarium fish profile for: ${species}

Return JSON with exactly these keys:
{
  "commonName": "",
  "scientificName": "",
  "temperatureC": { "min": null, "max": null },
  "pH": { "min": null, "max": null },
  "adultLengthCm": null,
  "diet": "",
  "temperament": "",
  "minimumGroupSize": null,
  "careNotes": "",
  "confidence": "low|medium|high"
}`;
}

function plantDataPrompt(plant) {
  return `Create a freshwater aquarium plant profile for: ${plant}

Return JSON with exactly these keys:
{
  "commonName": "",
  "scientificName": "",
  "light": "low|medium|high|unknown",
  "growthRate": "slow|medium|fast|unknown",
  "temperatureC": { "min": null, "max": null },
  "pH": { "min": null, "max": null },
  "placement": "",
  "careNotes": "",
  "confidence": "low|medium|high"
}`;
}

function assistantPrompt(message, context = {}) {
  return `User question: ${message}

Aquarium context:
${JSON.stringify(context, null, 2)}

Answer in clear, concise text. Mention when a water test, species confirmation, or professional advice is needed.`;
}

module.exports = { AQUARIUM_SYSTEM_PROMPT, fishDataPrompt, plantDataPrompt, assistantPrompt };
