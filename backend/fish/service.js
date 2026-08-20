const { searchFish: searchINaturalist } = require('./providers/inaturalist');
const { findFishImage } = require('./providers/wikimedia');

function toFishSpecies(item, imageData) {
  return {
    id: String(item.key),
    FBname: item.commonName,
    name: item.commonName,
    scientificName: item.scientificName,
    imageName: '',
    image: imageData.image,
    imageSourceUrl: imageData.imageSourceUrl,
    imageLicense: imageData.imageLicense,
    source: item.sourceUrl,
    schoolSize: '',
    tempC: '',
    pH: '',
  };
}

async function searchFish(query) {
  const searchTerm = String(query || '').trim();
  if (!searchTerm) return [];

  const species = await searchINaturalist(searchTerm);
  const uniqueSpecies = species.filter((item, index, list) => (
    list.findIndex((candidate) => candidate.scientificName === item.scientificName) === index
  ));

  return Promise.all(uniqueSpecies.map(async (item) => {
    if (item.image) {
      return toFishSpecies(item, item);
    }

    const imageData = await findFishImage(item.scientificName, item.commonName);
    return toFishSpecies(item, { ...item, ...imageData });
  }));
}

module.exports = { searchFish };
