const axios = require('axios');

const WIKIMEDIA_API_URL = 'https://commons.wikimedia.org/w/api.php';

async function findFishImage(scientificName, commonName) {
  const searchTerms = [scientificName, commonName].filter(Boolean);

  for (const searchTerm of searchTerms) {
    try {
      const response = await axios.get(WIKIMEDIA_API_URL, {
        params: {
          action: 'query',
          generator: 'search',
          gsrsearch: `${searchTerm} fish filetype:bitmap`,
          gsrnamespace: 6,
          gsrlimit: 1,
          prop: 'imageinfo',
          iiprop: 'url|extmetadata',
          iiurlwidth: 600,
          format: 'json',
        },
        timeout: 10000,
      });

      const page = Object.values(response.data?.query?.pages || {})[0];
      const imageInfo = page?.imageinfo?.[0];
      if (imageInfo?.thumburl || imageInfo?.url) {
        return {
          image: imageInfo.thumburl || imageInfo.url,
          imageSourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
          imageLicense: imageInfo.extmetadata?.LicenseShortName?.value || '',
        };
      }
    } catch (error) {
      console.warn(`Wikimedia image lookup failed for ${searchTerm}:`, error.message || error);
    }
  }

  return { image: '', imageSourceUrl: '', imageLicense: '' };
}

module.exports = { findFishImage };
