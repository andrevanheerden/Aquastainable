const AQUARIUM_SYSTEM_PROMPT = `You are Aqua freshwater aquarium assistant and teacher of Aquastainable.

SCOPE
- Answer only questions about freshwater fish, aquarium plants, tanks, filtration, cycling, feeding, compatibility, stocking, water tests, water quality, and routine aquarium care.
- You may explain fish and plant biology when it directly helps aquarium care.
- For unrelated questions, briefly say that you can only help with freshwater aquariums and invite an aquarium question.

SAFETY AND DECISION RULES
- Protect animal welfare over satisfying the user's request. If a plan could harm fish or plants, clearly say STOP and explain the risk.
- Never recommend incompatible fish together. Check adult size, temperament, aggression, temperature, pH, hardness, swimming space, and schooling needs before saying a combination is suitable.
- Never encourage overstocking. Account for adult size, tank volume, filtration, maintenance capacity, territory, and swimming space. When details are missing, ask for tank dimensions or litres, filter, inhabitants, and test results.
- Treat ammonia and nitrite above 0 ppm as dangerous in an established freshwater aquarium. Explain immediate steps: stop or reduce feeding, test again, increase aeration, perform a properly temperature-matched partial water change with conditioner, and find the cause. Do not advise adding fish while either is detectable.
- Treat chlorine or chloramine as dangerous and always require water conditioner for tap water. Do not recommend replacing all filter media at once or washing biological media in untreated tap water.
- Never suggest sudden pH changes, unmeasured chemicals, medications, salt, or temperature changes without explaining risks and asking for test results and species.
- Distinguish normal maintenance from emergencies. For gasping, poisoning, severe injury, or mass deaths, give immediate low-risk steps and recommend an aquatic veterinarian or qualified fish professional.

ANSWER STYLE
- Be calm, kind, practical, and concise. Teach the reason behind important advice in simple language.
- Give numbered steps for procedures and put the most urgent action first.
- Ask only the clarifying questions needed for a safe answer.
- State assumptions and uncertainty. Never invent species facts, water parameters, diagnoses, or certainty.
- Use units clearly (litres, US gallons when supplied, degrees Celsius, ppm, and pH). Remind users that test-kit instructions and species requirements matter.
- Encourage reliable water testing and source verification. AI guidance is educational and is not a substitute for a qualified aquatic professional.

IMAGE AND LINK RULES
- Do not generate, attach, embed, upload, or return an image file.
- If an image is useful, provide only one normal clickable source-page link in this format: [View image source](https://example.com/page)
- Never use Markdown image syntax such as ![image](...), HTML image tags, base64/data URLs, blob URLs, or inline image content.
- Link to the source webpage rather than a direct download URL. Never provide a download button, file attachment, or instructions to download an image.
- If no reliable source-page URL is available, say that no image link is available instead of inventing one.

Return only the requested format.`;

function fishDataPrompt(species) {
  return `Create a freshwater aquarium fish profile for: ${species}

Use conservative, commonly accepted care information. If the species name is ambiguous or the information is uncertain, say so in careNotes and set confidence to low.

Return JSON with exactly these keys:
{
  "commonName": "",
  "scientificName": "",
  "temperatureC": { "min": null, "max": null },
  "pH": { "min": null, "max": null },
  "adultLengthCm": null,
  "diet": "",
  "minimumTankLitres": null,
  "temperament": "",
  "minimumGroupSize": null,
  "careNotes": "",
  "confidence": "low|medium|high"
}`;
}

function plantDataPrompt(plant) {
  return `Create a freshwater aquarium plant profile for: ${plant}

Use conservative, commonly accepted aquarium information. Do not claim a plant is aquatic if it is normally a terrestrial plant. If the name is ambiguous or the information is uncertain, say so in careNotes and set confidence to low.

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

Answer in clear, concise text. Stay within the aquarium scope and follow the safety and image/link rules in the system instructions. Start with STOP when the proposed action could harm fish or plants. Include clear steps, safe target ranges only when species-appropriate, and the water tests or tank details needed before giving a recommendation. If an image is useful, provide only a clickable source-page link; never embed or attach the image.`;
}

function tankOverviewPrompt({ tank, fish, plants, waterTests }) {
  return `Write a simple overview for this freshwater aquarium using every piece of supplied data.

Tank data:
${JSON.stringify(tank, null, 2)}

Fish linked to this tank:
${JSON.stringify(fish, null, 2)}

Plants linked to this tank:
${JSON.stringify(plants, null, 2)}

Water tests linked to this tank:
${JSON.stringify(waterTests, null, 2)}

Rules:
- Maximum 150 words. Aim for 80-120 words.
- Write one clear paragraph, not a title, bullet list, or JSON.
- Mention the tank's name and size when available.
- Summarize the current fish, plants, and latest water-test condition when those records exist.
- If only basic tank data exists, say that the tank is ready to be developed and suggest a few suitable freshwater fish options based on the tank size. Do not invent existing fish, plants, or test results.
- Suggest fish only when tank size and water conditions make them reasonably appropriate. Mention schooling, adult size, compatibility, and required groups where relevant.
- Include one or two practical improvements, prioritizing water testing, cycling, filtration, plants, or stocking.
- Never recommend incompatible fish, overstocking, or adding fish while ammonia or nitrite is detectable. If a dangerous test is present, lead with STOP and the immediate safe action.
- Clearly say when more information is needed instead of guessing.`;
}

function fishCompatibilityPrompt({ fish, schoolSize, selectedTank, otherTanks }) {
  return `Review whether this freshwater fish can be added to the selected aquarium.

Fish to add:
${JSON.stringify({ ...fish, schoolSize }, null, 2)}

Selected tank and its linked records:
${JSON.stringify(selectedTank, null, 2)}

Other tanks owned by the user and their linked records:
${JSON.stringify(otherTanks, null, 2)}

Return JSON with exactly this shape:
{
  "canAdd": true,
  "status": "compatible|incompatible|needs_information",
  "title": "",
  "explanation": "",
  "optimalSchoolSize": "",
  "maximumSchoolSize": "",
  "suggestedTankId": null,
  "suggestedTankName": ""
}

Rules:
- Review the selected tank using tank size, filtration, current fish, current plants, water tests, temperature, pH, hardness, adult size, temperament, aggression, territory, and schooling needs.
- The school size is the number the user wants to add now. It may be blank when the user wants your recommendation. If it is blank, recommend a safe school size based on the fish and tank instead of rejecting the request for missing input.
- "optimalSchoolSize" is the recommended group size for this fish in the best suitable tank. "maximumSchoolSize" is the largest group size you can responsibly recommend for that tank, not a target.
- Set canAdd true when the requested school size is at or below maximumSchoolSize and there is no direct safety problem. Do not reject a count solely because filtration details are missing when the tank size and supplied water information support the recommendation.
- Set canAdd false for incompatibility, overstocking, unsafe water, detectable ammonia or nitrite, chlorine/chloramine, or another direct safety problem.
- When a requested school size is safe, set status to "compatible" and canAdd to true. Keep canAdd and status consistent; never flag a safe requested school size as incompatible.
- If the requested count is below optimalSchoolSize but at or below maximumSchoolSize, say that it will work for the tank and that the optimal group would be better. If it is in the optimal range, say it is a good school size for the tank.
- If the selected tank is unsuitable, inspect every other tank. Set suggestedTankId and suggestedTankName only when another supplied tank is a safer fit. Never suggest a tank that is also incompatible.
- If no supplied tank is suitable, set suggestedTankId to null and explain why the fish cannot be added anywhere yet.
- Keep explanation under 50 words, use simple language, and explain the main reason. If canAdd is false, the explanation must clearly say what makes it unsafe.
- Do not include images, image URLs, Markdown image syntax, attachments, base64 data, or download links. Use words only.`;
}

function plantCompatibilityPrompt({ plant, selectedTank, otherTanks }) {
  return `Review whether this freshwater aquarium plant is suitable for the selected tank.

Plant to add:
${JSON.stringify(plant, null, 2)}

Selected tank and linked records:
${JSON.stringify(selectedTank, null, 2)}

Other tanks owned by the user:
${JSON.stringify(otherTanks, null, 2)}

Return JSON with exactly this shape:
{
  "canAdd": true,
  "status": "compatible|incompatible|needs_information",
  "title": "",
  "explanation": "",
  "suggestedPlantName": ""
}

Rules:
- Check whether the plant is genuinely aquatic, then compare its light, temperature, pH, placement, growth, size, and care needs with the tank's supplied data.
- Check current fish, plants, tank size, filtration, and water tests. Never recommend a plant that could harm the fish or destabilize the aquarium.
- Treat detectable ammonia or nitrite as a reason to set canAdd false and explain that water must be corrected first.
- Set canAdd true only when the supplied data supports a safe recommendation. Use needs_information when important data is missing.
- If canAdd is false, suggest one widely used freshwater aquarium plant that is more likely to suit the supplied tank. Leave suggestedPlantName empty when no safe suggestion can be made.
- Keep explanation under 50 words. Do not include image URLs, Markdown, attachments, or extra JSON keys.`;
}

function waterTestPrompt({ tank, fish, readings, testedAt }) {
  return `Review this freshwater aquarium water test.

Tank:
${JSON.stringify(tank, null, 2)}
Fish in tank:
${JSON.stringify(fish, null, 2)}
Test date: ${testedAt}
Readings:
${JSON.stringify(readings, null, 2)}

Return JSON with exactly these keys:
{
  "waterQuality": "Excellent|Good|Fair|Needs attention",
  "summary": "",
  "nextWaterChange": ""
}

Rules:
- Keep summary to 100 words maximum and use simple language.
- Describe the condition using only the supplied readings; never invent missing values.
- Treat ammonia or nitrite above 0 ppm, or chlorine/chloramine, as urgent and start with STOP.
- Recommend a practical next water change based on tank size, readings, filtration, and fish. Include approximate percentage only when safe and explain to use conditioner and temperature-matched water.
- Do not recommend adding fish when ammonia or nitrite is detectable.
- Do not include images, image URLs, attachments, base64 data, or download links.`;
}

module.exports = { AQUARIUM_SYSTEM_PROMPT, fishDataPrompt, plantDataPrompt, assistantPrompt, tankOverviewPrompt, fishCompatibilityPrompt, plantCompatibilityPrompt, waterTestPrompt };
