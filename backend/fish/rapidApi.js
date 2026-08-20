const axios = require('axios');

const RAPIDAPI_HOST = 'list-of-freshwater-aquarium-fish-species.p.rapidapi.com';
const RAPIDAPI_URL = `https://${RAPIDAPI_HOST}/species`;

let cachedFishList = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // Cache for 24 hours

const FALLBACK_FISH = [
  {
    id: 'guppy',
    FBname: 'Guppy',
    GenName: 'Poecilia',
    Species: 'reticulata',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Poecilia%20reticulata.jpg',
    TempMin: 18,
    TempMax: 28,
    pHMin: 7,
    pHMax: 8,
  },
  {
    id: 'betta',
    FBname: 'Betta',
    GenName: 'Betta',
    Species: 'splendens',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Betta%20splendens.jpg',
    TempMin: 24,
    TempMax: 30,
    pHMin: 6,
    pHMax: 8,
  },
  {
    id: 'neon-tetra',
    FBname: 'Neon Tetra',
    GenName: 'Paracheirodon',
    Species: 'innesi',
    TempMin: 20,
    TempMax: 26,
    pHMin: 5,
    pHMax: 7,
  },
];

function normalizeFishResult(item, index = 0) {
  const commonName = item?.FBname || item?.name || item?.common_name || item?.commonName || item?.title || item?.fish_name || '';
  const scientificName = item?.scientific_name || item?.scientificName || [item?.GenName, item?.Species].filter(Boolean).join(' ') || '';
  const rawImage = item?.image_url || item?.imageUrl || item?.image || item?.img || item?.ImgName || '';
  const image = /^https?:\/\//i.test(rawImage) ? rawImage : '';

  return {
    id: item?.id || `${commonName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
    FBname: commonName,
    name: commonName,
    scientificName,
    image,
    schoolSize: item?.schoolSize || item?.school_size || '',
    tempC: item?.tempC || item?.temp_celsius || (item?.TempMin != null ? `${item.TempMin}-${item.TempMax}` : ''),
    pH: item?.pH || (item?.pHMin != null ? `${item.pHMin}-${item.pHMax}` : ''),
  };
}

async function getAllFish() {
  const now = Date.now();
  if (cachedFishList && (now - lastFetchTime < CACHE_TTL)) {
    return cachedFishList;
  }

  if (!process.env.RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is not configured in environment variables.');
  }

  let records;
  try {
    const response = await axios.get(RAPIDAPI_URL, {
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
      timeout: 10000,
    });

    records = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.species || response.data?.results || [];
  } catch (error) {
    console.warn(`RapidAPI fish source unavailable (${error.response?.status || error.code || 'unknown'}); using fallback species.`);
    records = FALLBACK_FISH;
  }

  if (!records.length) {
    records = FALLBACK_FISH;
  }
  cachedFishList = records.map((entry, index) => normalizeFishResult(entry, index));
  lastFetchTime = now;
  
  return cachedFishList;
}

async function searchFish(query) {
  const searchTerm = String(query || '').trim().toLowerCase();
  if (!searchTerm) return [];

  const allFish = await getAllFish();
  return allFish
    .filter((fish) => fish.name.toLowerCase().includes(searchTerm) || fish.scientificName.toLowerCase().includes(searchTerm))
    .filter((fish, index, arr) => arr.findIndex((item) => item.name === fish.name) === index)
    .slice(0, 10);
}

module.exports = { searchFish };