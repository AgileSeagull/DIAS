const axios = require('axios');

/**
 * Common country mappings for states/regions
 */
const REGION_TO_COUNTRY = {
  // US States
  'alaska': 'United States',
  'california': 'United States',
  'ca': 'United States',
  'texas': 'United States',
  'florida': 'United States',
  'hawaii': 'United States',
  'new york': 'United States',
  'washington': 'United States',
  'oregon': 'United States',
  'nevada': 'United States',
  'arizona': 'United States',
  'colorado': 'United States',
  'montana': 'United States',
  'wyoming': 'United States',
  'idaho': 'United States',
  'utah': 'United States',
  'new mexico': 'United States',
  'north dakota': 'United States',
  'south dakota': 'United States',
  'nebraska': 'United States',
  'kansas': 'United States',
  'oklahoma': 'United States',
  'missouri': 'United States',
  'iowa': 'United States',
  'arkansas': 'United States',
  'louisiana': 'United States',
  'mississippi': 'United States',
  'alabama': 'United States',
  'tennessee': 'United States',
  'kentucky': 'United States',
  'indiana': 'United States',
  'illinois': 'United States',
  'wisconsin': 'United States',
  'michigan': 'United States',
  'minnesota': 'United States',
  'ohio': 'United States',
  'pennsylvania': 'United States',
  'west virginia': 'United States',
  'virginia': 'United States',
  'north carolina': 'United States',
  'south carolina': 'United States',
  'georgia': 'United States',
  'maine': 'United States',
  'vermont': 'United States',
  'new hampshire': 'United States',
  'massachusetts': 'United States',
  'rhode island': 'United States',
  'connecticut': 'United States',
  'new jersey': 'United States',
  'delaware': 'United States',
  'maryland': 'United States',
  
  // Canadian Provinces
  'british columbia': 'Canada',
  'alberta': 'Canada',
  'saskatchewan': 'Canada',
  'manitoba': 'Canada',
  'ontario': 'Canada',
  'quebec': 'Canada',
  'new brunswick': 'Canada',
  'nova scotia': 'Canada',
  'prince edward island': 'Canada',
  'newfoundland': 'Canada',
  'yukon': 'Canada',
  'northwest territories': 'Canada',
  'nunavut': 'Canada',
  
  // Australian States
  'new south wales': 'Australia',
  'queensland': 'Australia',
  'victoria': 'Australia',
  'tasmania': 'Australia',
  'south australia': 'Australia',
  'western australia': 'Australia',
  'northern territory': 'Australia',
  
  // Regions
  'puerto rico': 'United States',
  'guam': 'United States',
  'northern mariana islands': 'United States',
  'us virgin islands': 'United States',
};

/**
 * List of valid countries (major ones)
 */
const KNOWN_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Bolivia', 'Brazil', 'Bulgaria',
  'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia',
  'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Finland', 'France', 'Germany', 'Greece', 'Guatemala',
  'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
  'Lebanon', 'Libya', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Myanmar',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'Norway',
  'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Romania', 'Russia', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 
  'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tanzania', 'Thailand', 'Turkey', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen'
];

/**
 * Extract country from disaster location_name
 */
const extractCountry = (locationName) => {
  if (!locationName) return null;
  
  // Split by comma and clean up
  const parts = locationName.split(',').map(p => p.trim());
  
  // Check each part for known country
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const lowerPart = part.toLowerCase();
    
    // Check if it's a region/state that maps to a country
    if (REGION_TO_COUNTRY[lowerPart]) {
      return REGION_TO_COUNTRY[lowerPart];
    }
    
    // Check if it's a known country
    const matchedCountry = KNOWN_COUNTRIES.find(
      country => country.toLowerCase() === lowerPart
    );
    
    if (matchedCountry) {
      return matchedCountry;
    }
    
    // Partial match for countries
    const partialMatch = KNOWN_COUNTRIES.find(
      country => country.toLowerCase().includes(lowerPart) || 
                 lowerPart.includes(country.toLowerCase())
    );
    
    if (partialMatch) {
      return partialMatch;
    }
  }
  
  // If last part looks like a country but not in our list, use it
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    // Check if it's not too short and not a number
    if (lastPart.length > 2 && !/^\d/.test(lastPart)) {
      return lastPart
        .replace(/^the\s+/i, '')
        .replace(/\s+republic$/i, '')
        .trim();
    }
  }
  
  return null;
};

/**
 * Get country from coordinates using reverse geocoding
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string|null>} Country name
 */
const getCountryFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        zoom: 3, // Country level
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'DIAS-DisasterAlert/1.0',
      },
      timeout: 5000,
    });

    if (response.data && response.data.address) {
      const country = response.data.address.country;
      
      if (country) {
        console.log(`📍 Geocoded (${latitude}, ${longitude}) → ${country}`);
        return country;
      }
    }
  } catch (error) {
    console.error(`❌ Geocoding failed for (${latitude}, ${longitude}):`, error.message);
  }
  
  return null;
};

/**
 * Extract country from disaster with multiple fallback methods
 * @param {Object} disaster - Disaster object with location_name, latitude, longitude
 * @returns {Promise<string>} Country name
 */
const extractCountryFromDisaster = async (disaster) => {
  // Method 1: Try extracting from location_name
  let country = extractCountry(disaster.location_name);
  
  if (country) {
    return country;
  }
  
  // Method 2: Try reverse geocoding from coordinates
  if (disaster.latitude && disaster.longitude) {
    console.log(`⚠️  No country in location "${disaster.location_name}", trying coordinates...`);
    
    const geocodedCountry = await getCountryFromCoordinates(
      disaster.latitude,
      disaster.longitude
    );
    
    if (geocodedCountry) {
      return geocodedCountry;
    }
  }
  
  // Method 3: Try parsing description
  if (disaster.description) {
    country = extractCountry(disaster.description);
    if (country) {
      console.log(`📝 Found country in description: ${country}`);
      return country;
    }
  }
  
  // Fallback
  console.log(`⚠️  Could not determine country for disaster at (${disaster.latitude}, ${disaster.longitude})`);
  return 'Unknown';
};

/**
 * Group disasters by country (async version)
 * @param {Array} disasters - Array of disaster objects
 * @returns {Promise<Object>} Disasters grouped by country
 */
const groupDisastersByCountry = async (disasters) => {
  const grouped = {};
  
  for (const disaster of disasters) {
    const country = await extractCountryFromDisaster(disaster);
    
    if (!grouped[country]) {
      grouped[country] = [];
    }
    
    grouped[country].push(disaster);
  }
  
  return grouped;
};

/**
 * Get country counts from disasters (async version)
 * @param {Array} disasters - Array of disaster objects
 * @returns {Promise<Object>} Country counts { country: count }
 */
const getCountryCounts = async (disasters) => {
  const counts = {};
  
  for (const disaster of disasters) {
    const country = await extractCountryFromDisaster(disaster);
    counts[country] = (counts[country] || 0) + 1;
  }
  
  return counts;
};

/**
 * Batch process disasters to extract countries (more efficient)
 * @param {Array} disasters - Array of disaster objects
 * @returns {Promise<Map>} Map of disaster.id -> country
 */
const batchExtractCountries = async (disasters) => {
  const countryMap = new Map();
  
  // Process in parallel with limit to avoid rate limiting
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < disasters.length; i += BATCH_SIZE) {
    const batch = disasters.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.all(
      batch.map(async (disaster) => {
        const country = await extractCountryFromDisaster(disaster);
        return { id: disaster.id, country };
      })
    );
    
    results.forEach(({ id, country }) => {
      countryMap.set(id, country);
    });
    
    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < disasters.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return countryMap;
};

module.exports = {
  extractCountry,
  extractCountryFromDisaster,
  getCountryFromCoordinates,
  groupDisastersByCountry,
  getCountryCounts,
  batchExtractCountries,
};
