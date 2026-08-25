const axios = require('axios');

const GBIF_BASE_URL = 'https://api.gbif.org/v1';

async function searchSpecies(query) {
  const response = await axios.get(`${GBIF_BASE_URL}/species/search`, {
    params: {
      q: query,
      rank: 'SPECIES',
      limit: 10,
      facet: false,
    },
    timeout: 15000,
  });

  const results = Array.isArray(response.data?.results) ? response.data.results : [];
  return results
    .filter((item) => item.kingdom === 'Animalia')
    .filter((item) => ['Actinopterygii', 'Actinopteri', 'Cladistia'].includes(item.class))
    .filter((item) => item.rank === 'SPECIES' && item.scientificName)
    .map((item) => ({
      provider: 'GBIF',
      key: item.key,
      commonName: item.vernacularName || item.canonicalName || item.scientificName,
      scientificName: item.scientificName,
      canonicalName: item.canonicalName || item.scientificName,
      kingdom: item.kingdom,
      className: item.class,
      sourceUrl: `https://www.gbif.org/species/${item.key}`,
    }));
}

module.exports = { searchSpecies };
