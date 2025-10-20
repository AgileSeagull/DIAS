const axios = require('axios');

/**
 * Reverse geocoding service using Nominatim (OpenStreetMap)
 * Caches results to reduce API calls
 */

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

/**
 * Reverse geocode coordinates to location name
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Location name
 */
const reverseGeocode = async (lat, lng) => {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'DIAS-Disaster-Information-System/1.0',
      },
      timeout: 5000,
    });

    lastRequestTime = Date.now();

    let locationName = 'Unknown Location';
    if (response.data && response.data.address) {
      const addr = response.data.address;
      const parts = [];

      if (addr.city) parts.push(addr.city);
      else if (addr.town) parts.push(addr.town);
      else if (addr.village) parts.push(addr.village);

      if (addr.state) parts.push(addr.state);
      if (addr.country) parts.push(addr.country);

      locationName = parts.length > 0 ? parts.join(', ') : response.data.display_name || 'Unknown Location';
    }

    // Cache result
    cache.set(cacheKey, {
      data: locationName,
      timestamp: Date.now(),
    });

    return locationName;
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    // Return a fallback
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
};

/**
 * Batch reverse geocode multiple coordinates
 * @param {Array} coordinates - Array of {lat, lng} objects
 * @returns {Promise<Array>} Array of location names
 */
const batchReverseGeocode = async (coordinates) => {
  const results = [];
  for (const coord of coordinates) {
    const location = await reverseGeocode(coord.lat, coord.lng);
    results.push(location);
    // Delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return results;
};

/**
 * Clear the cache
 */
const clearCache = () => {
  cache.clear();
};

/**
 * Get cache size
 * @returns {number} Cache size
 */
const getCacheSize = () => {
  return cache.size;
};

module.exports = {
  reverseGeocode,
  batchReverseGeocode,
  clearCache,
  getCacheSize,
};

