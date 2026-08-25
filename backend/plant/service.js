const { searchPlants: searchINaturalist } = require('./providers/inaturalist');

const CURATED_AQUARIUM_PLANTS = [
  {
    id: 'curated-duckweed',
    name: 'Duckweed',
    scientificName: 'Lemna minor',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Lemna_minor_1.jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Lemna_minor_1.jpg',
    imageLicense: 'CC BY-SA',
    source: 'https://www.inaturalist.org/taxa/48489-Lemna-minor',
  },
];

async function searchPlants(query) {
  const searchTerm = String(query || '').trim();
  if (!searchTerm) return [];

  let plants = [];
  try {
    plants = await searchINaturalist(searchTerm);
  } catch (error) {
    console.warn('Plant provider unavailable:', error.message || error);
  }

  const curatedMatches = CURATED_AQUARIUM_PLANTS.filter((plant) => (
    plant.name.toLowerCase().includes(searchTerm.toLowerCase())
    || plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  return [...curatedMatches, ...plants].filter((item, index, list) => (
    list.findIndex((candidate) => candidate.scientificName === item.scientificName) === index
  ));
}

module.exports = { searchPlants };
