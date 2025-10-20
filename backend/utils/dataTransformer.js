const { calculateSeverity } = require('./severityCalculator');

/**
 * Transform and validate disaster data from external APIs
 */

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} Is valid
 */
const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Format date consistently
 * @param {string|number|Date} date - Input date
 * @returns {Date} Formatted date
 */
const formatDate = (date) => {
  if (!date) return new Date();
  if (typeof date === 'number') {
    // Unix timestamp in milliseconds
    return new Date(date);
  }
  return new Date(date);
};

/**
 * Validate required fields for disaster object
 * @param {object} disaster - Disaster object
 * @returns {boolean} Is valid
 */
const validateDisaster = (disaster) => {
  return (
    disaster &&
    typeof disaster === 'object' &&
    disaster.disaster_id &&
    disaster.type &&
    disaster.severity &&
    disaster.latitude &&
    disaster.longitude &&
    disaster.occurred_at
  );
};

/**
 * Transform USGS earthquake data to our schema
 * @param {object} event - USGS event object
 * @param {string} disasterId - Unique ID
 * @returns {object} Transformed disaster object
 */
const transformEarthquake = (event, disasterId) => {
  const { properties, geometry } = event;
  const coordinates = geometry.coordinates;
  
  if (!validateCoordinates(coordinates[1], coordinates[0])) {
    return null;
  }

  const magnitude = properties.mag || 0;
  const depth = coordinates[2] || 0;
  const severity = require('./severityCalculator').calculateEarthquakeSeverity(magnitude);

  return {
    disaster_id: disasterId || `usgs-${properties.code}`,
    type: 'earthquake',
    severity,
    title: `M${magnitude.toFixed(1)} Earthquake ${properties.place || 'Location Unknown'}`,
    description: `Depth: ${depth.toFixed(1)}km`,
    location_name: properties.place || 'Unknown Location',
    latitude: parseFloat(coordinates[1].toFixed(8)),
    longitude: parseFloat(coordinates[0].toFixed(8)),
    magnitude: parseFloat(magnitude.toFixed(1)),
    depth: parseFloat(depth.toFixed(2)),
    affected_area: null,
    source: 'USGS',
    external_url: properties.url || null,
    occurred_at: formatDate(properties.time),
    is_active: true,
  };
};

/**
 * Transform flood data to our schema
 * @param {object} event - Flood event
 * @param {string} disasterId - Unique ID
 * @returns {object} Transformed disaster object
 */
const transformFlood = (event, disasterId) => {
  if (!validateCoordinates(event.latitude, event.longitude)) {
    return null;
  }

  return {
    disaster_id: disasterId || `flood-${Date.now()}-${Math.random()}`,
    type: 'flood',
    severity: event.severity || 'moderate',
    title: event.title || 'Flood Alert',
    description: event.description || 'Flood warning issued',
    location_name: event.location_name || 'Unknown Location',
    latitude: parseFloat(event.latitude.toFixed(8)),
    longitude: parseFloat(event.longitude.toFixed(8)),
    magnitude: null,
    depth: null,
    affected_area: event.affected_area || null,
    source: event.source || 'GDACS',
    external_url: event.url || null,
    occurred_at: formatDate(event.occurred_at || Date.now()),
    is_active: true,
  };
};

/**
 * Transform fire data to our schema
 * @param {object} event - Fire event
 * @param {string} disasterId - Unique ID
 * @returns {object} Transformed disaster object
 */
const transformFire = (event, disasterId) => {
  if (!validateCoordinates(event.latitude, event.longitude)) {
    return null;
  }

  const severity = require('./severityCalculator').calculateFireSeverity(
    event.brightness || 320,
    event.frp || 0
  );

  return {
    disaster_id: disasterId || `fire-${event.acq_date}-${event.latitude}-${event.longitude}`,
    type: 'fire',
    severity,
    title: event.title || `Wildfire detected near ${event.location_name || 'Unknown Location'}`,
    description: event.description || `Brightness: ${event.brightness}K, Confidence: ${event.confidence}%`,
    location_name: event.location_name || 'Unknown Location',
    latitude: parseFloat(event.latitude.toFixed(8)),
    longitude: parseFloat(event.longitude.toFixed(8)),
    magnitude: null,
    depth: null,
    affected_area: event.area || null,
    source: 'NASA FIRMS',
    external_url: null,
    occurred_at: formatDate(event.occurred_at || Date.now()),
    is_active: true,
  };
};

/**
 * Transform cyclone data to our schema
 * @param {object} event - Cyclone event
 * @param {string} disasterId - Unique ID
 * @returns {object} Transformed disaster object
 */
const transformCyclone = (event, disasterId) => {
  if (!validateCoordinates(event.latitude, event.longitude)) {
    return null;
  }

  const severity = require('./severityCalculator').calculateCycloneSeverity(
    event.windSpeed || 0,
    event.category || 0
  );

  return {
    disaster_id: disasterId || `cyclone-${event.name || Date.now()}`,
    type: 'cyclone',
    severity,
    title: event.title || `${event.name || 'Cyclone'} - Category ${event.category || 'Storm'}`,
    description: event.description || `Wind Speed: ${event.windSpeed || 0} mph`,
    location_name: event.location_name || 'Unknown Location',
    latitude: parseFloat(event.latitude.toFixed(8)),
    longitude: parseFloat(event.longitude.toFixed(8)),
    magnitude: event.category || null,
    depth: null,
    affected_area: event.affected_area || null,
    source: event.source || 'NOAA',
    external_url: event.url || null,
    occurred_at: formatDate(event.occurred_at || Date.now()),
    is_active: true,
  };
};

/**
 * Remove duplicates based on disaster_id
 * @param {Array} disasters - Array of disaster objects
 * @returns {Array} Filtered array
 */
const removeDuplicates = (disasters) => {
  const seen = new Set();
  return disasters.filter(disaster => {
    if (seen.has(disaster.disaster_id)) {
      return false;
    }
    seen.add(disaster.disaster_id);
    return true;
  });
};

/**
 * Filter out invalid disasters
 * @param {Array} disasters - Array of disaster objects
 * @returns {Array} Valid disasters
 */
const filterValidDisasters = (disasters) => {
  return disasters
    .map(disaster => {
      if (!validateDisaster(disaster)) {
        console.warn('Invalid disaster data:', disaster);
        return null;
      }
      return disaster;
    })
    .filter(Boolean);
};

module.exports = {
  validateCoordinates,
  formatDate,
  validateDisaster,
  transformEarthquake,
  transformFlood,
  transformFire,
  transformCyclone,
  removeDuplicates,
  filterValidDisasters,
};

