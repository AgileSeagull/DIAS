/**
 * Calculate severity level for different disaster types
 */

/**
 * Calculate earthquake severity based on magnitude
 * @param {number} magnitude - Earthquake magnitude
 * @returns {string} Severity level
 */
const calculateEarthquakeSeverity = (magnitude) => {
  if (magnitude >= 7) return 'critical';
  if (magnitude >= 5.5) return 'high';
  if (magnitude >= 4) return 'moderate';
  return 'low';
};

/**
 * Calculate flood severity based on alert level and affected population
 * @param {string} alertLevel - Alert level (Red/Orange/Yellow/Green)
 * @param {number} affectedPopulation - Number of people affected
 * @returns {string} Severity level
 */
const calculateFloodSeverity = (alertLevel = 'Green', affectedPopulation = 0) => {
  const alertMap = { 'Red': 4, 'Orange': 3, 'Yellow': 2, 'Green': 1 };
  const alertValue = alertMap[alertLevel] || 1;
  
  if (alertValue === 4 || affectedPopulation > 1000000) return 'critical';
  if (alertValue >= 3 || affectedPopulation > 100000) return 'high';
  if (alertValue >= 2 || affectedPopulation > 10000) return 'moderate';
  return 'low';
};

/**
 * Calculate fire severity based on brightness and FRP
 * @param {number} brightness - Brightness temperature in Kelvin
 * @param {number} frp - Fire Radiative Power in MW
 * @returns {string} Severity level
 */
const calculateFireSeverity = (brightness, frp) => {
  // High brightness (>400K) or FRP indicates large/intense fire
  if (brightness > 400 || frp > 100) return 'critical';
  if (brightness > 350 || frp > 50) return 'high';
  if (brightness > 320 || frp > 20) return 'moderate';
  return 'low';
};

/**
 * Calculate cyclone severity based on wind speed and category
 * @param {number} windSpeed - Wind speed in mph
 * @param {number} category - Hurricane category (1-5)
 * @returns {string} Severity level
 */
const calculateCycloneSeverity = (windSpeed, category) => {
  // Category-based classification
  if (category >= 4 || windSpeed >= 130) return 'critical';
  if (category >= 2 || windSpeed >= 96) return 'high';
  if (category >= 1 || windSpeed >= 74) return 'moderate';
  if (windSpeed >= 39) return 'low';
  return 'low'; // Tropical depression
};

/**
 * Generic severity calculator based on disaster type
 * @param {string} type - Disaster type
 * @param {object} params - Parameters specific to disaster type
 * @returns {string} Severity level
 */
const calculateSeverity = (type, params) => {
  switch (type) {
    case 'earthquake':
      return calculateEarthquakeSeverity(params.magnitude);
    case 'flood':
      return calculateFloodSeverity(params.alertLevel, params.affectedPopulation);
    case 'fire':
      return calculateFireSeverity(params.brightness, params.frp);
    case 'cyclone':
      return calculateCycloneSeverity(params.windSpeed, params.category);
    default:
      return 'moderate';
  }
};

module.exports = {
  calculateEarthquakeSeverity,
  calculateFloodSeverity,
  calculateFireSeverity,
  calculateCycloneSeverity,
  calculateSeverity,
};

