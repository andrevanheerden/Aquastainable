const axios = require('axios');

const INATURALIST_API_URL = 'https://api.inaturalist.org/v1/taxa/autocomplete';

async function searchFish(query) {
  const response = await axios.get(INATURALIST_API_URL, {
    params: {
      q: query,
      rank: 'species',
      per_page: 10,
    },
    headers: {
      'User-Agent': 'Aquastainable/1.0 (aquarium care app)',
    },
    timeout: 15000,
  });

  return (response.data?.results || [])
    .filter((item) => item.rank === 'species' && item.iconic_taxon_name === 'Actinopterygii')
    .map((item) => ({
      provider: 'iNaturalist',
      key: item.id,
      commonName: item.preferred_common_name || item.name,
      scientificName: item.name,
      image: item.default_photo?.medium_url || item.default_photo?.url || '',
      imageSourceUrl: item.default_photo?.id
        ? `https://www.inaturalist.org/photos/${item.default_photo.id}`
        : '',
      imageLicense: item.default_photo?.license_code || '',
      sourceUrl: `https://www.inaturalist.org/taxa/${item.id}`,
    }));
}

module.exports = { searchFish };
