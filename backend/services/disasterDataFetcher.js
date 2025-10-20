/**
 * Master service to coordinate fetching disaster data from all sources
 */

const earthquakeService = require('./earthquakeService');
const floodService = require('./floodService');
const fireService = require('./fireService');
const cycloneService = require('./cycloneService');

/**
 * Fetch all disaster data from all sources
 * @returns {Promise<object>} Summary of all fetches
 */
const fetchAllDisasterData = async () => {
  console.log('\n🔍 Starting comprehensive disaster data fetch...\n');

  const results = {
    timestamp: new Date().toISOString(),
    success: true,
    sources: {},
  };

  // Fetch each disaster type in parallel
  const [earthquakeResult, floodResult, fireResult, cycloneResult] = await Promise.allSettled([
    earthquakeService.fetchEarthquakeData(),
    floodService.fetchFloodData(),
    fireService.fetchFireData(),
    cycloneService.fetchCycloneData(),
  ]);

  // Process earthquake results
  if (earthquakeResult.status === 'fulfilled') {
    results.sources.earthquake = earthquakeResult.value;
  } else {
    results.sources.earthquake = { success: false, error: earthquakeResult.reason.message };
  }

  // Process flood results
  if (floodResult.status === 'fulfilled') {
    results.sources.flood = floodResult.value;
  } else {
    results.sources.flood = { success: false, error: floodResult.reason.message };
  }

  // Process fire results
  if (fireResult.status === 'fulfilled') {
    results.sources.fire = fireResult.value;
  } else {
    results.sources.fire = { success: false, error: fireResult.reason.message };
  }

  // Process cyclone results
  if (cycloneResult.status === 'fulfilled') {
    results.sources.cyclone = cycloneResult.value;
  } else {
    results.sources.cyclone = { success: false, error: cycloneResult.reason.message };
  }

  // Calculate summary
  const summary = {
    total: 0,
    new: 0,
    updated: 0,
  };

  Object.values(results.sources).forEach(source => {
    if (source.success) {
      summary.total += source.total || 0;
      summary.new += source.new || 0;
      summary.updated += source.updated || 0;
    }
  });

  results.summary = summary;

  // Overall success if at least one source succeeded
  results.success = Object.values(results.sources).some(s => s.success);

  console.log('\n✅ Disaster data fetch completed:');
  console.log(`   📊 Total disasters: ${summary.total}`);
  console.log(`   ✨ New: ${summary.new}, 📝 Updated: ${summary.updated}\n`);

  return results;
};

/**
 * Fetch data for a specific disaster type
 * @param {string} type - Disaster type ('earthquake', 'flood', 'fire', 'cyclone')
 * @returns {Promise<object>} Result
 */
const fetchDisasterDataByType = async (type) => {
  switch (type) {
    case 'earthquake':
      return await earthquakeService.fetchEarthquakeData();
    case 'flood':
      return await floodService.fetchFloodData();
    case 'fire':
      return await fireService.fetchFireData();
    case 'cyclone':
      return await cycloneService.fetchCycloneData();
    default:
      return {
        success: false,
        error: `Unknown disaster type: ${type}`,
      };
  }
};

/**
 * Get statistics for all disaster types
 * @returns {Promise<object>} Statistics
 */
const getAllDisasterStats = async () => {
  const [earthquakeStats, floodStats, fireStats, cycloneStats] = await Promise.all([
    earthquakeService.getEarthquakeStats(),
    floodService.getFloodStats(),
    fireService.getFireStats(),
    cycloneService.getCycloneStats(),
  ]);

  return {
    earthquake: earthquakeStats.success ? earthquakeStats.data : null,
    flood: floodStats.success ? floodStats.data : null,
    fire: fireStats.success ? fireStats.data : null,
    cyclone: cycloneStats.success ? cycloneStats.data : null,
  };
};

module.exports = {
  fetchAllDisasterData,
  fetchDisasterDataByType,
  getAllDisasterStats,
};

