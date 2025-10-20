const cron = require('node-cron');
const { query } = require('../config/database');
const { publishAlert, updateDisasterCount, cleanupInactiveTopics, createTopicForCountry } = require('../services/awsSnsService');
const { extractCountryFromDisaster, getCountryCounts } = require('../utils/countryExtractor');

/**
 * Track last processed disasters to detect new ones
 */
let lastProcessedDisasterIds = new Set();

/**
 * Initialize the set with existing disaster IDs
 */
const initializeProcessedDisasters = async () => {
  try {
    const result = await query('SELECT id FROM disasters WHERE is_active = true');
    lastProcessedDisasterIds = new Set(result.rows.map(row => row.id));
    console.log(`📊 Initialized with ${lastProcessedDisasterIds.size} existing disasters`);
  } catch (error) {
    console.error('❌ Failed to initialize processed disasters:', error.message);
  }
};

/**
 * Format disaster alert message
 */
const formatAlertMessage = (disaster) => {
  const emoji = {
    earthquake: '🌋',
    flood: '🌊',
    fire: '🔥',
    cyclone: '🌪️',
  }[disaster.type] || '⚠️';

  let message = `${emoji} ${disaster.type.toUpperCase()} ALERT\n\n`;
  message += `Location: ${disaster.location_name}\n`;
  message += `Severity: ${disaster.severity.toUpperCase()}\n`;
  message += `Time: ${new Date(disaster.occurred_at).toLocaleString()}\n\n`;

  if (disaster.magnitude) {
    message += `Magnitude: ${disaster.magnitude}\n`;
  }

  if (disaster.depth) {
    message += `Depth: ${disaster.depth} km\n`;
  }

  if (disaster.description) {
    message += `\nDetails: ${disaster.description}\n`;
  }

  message += `\nCoordinates: ${disaster.latitude}, ${disaster.longitude}\n`;

  if (disaster.external_url) {
    message += `\nMore Info: ${disaster.external_url}\n`;
  }

  message += `\n---\nThis is an automated alert from DIAS (Disaster Information & Alert System).\n`;
  message += `Stay safe and follow local emergency guidelines.`;

  return message;
};

/**
 * Format alert subject
 */
const formatAlertSubject = (disaster, country) => {
  const emoji = {
    earthquake: '🌋',
    flood: '🌊',
    fire: '🔥',
    cyclone: '🌪️',
  }[disaster.type] || '⚠️';

  return `${emoji} ${disaster.severity.toUpperCase()} ${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)} Alert in ${country}`;
};

/**
 * Process new disasters and send alerts
 */
const processNewDisasters = async () => {
  try {
    console.log('\n🔍 Checking for new disasters...');

    // Get all active disasters
    const result = await query(
      `SELECT id, type, severity, title, description, location_name, 
              latitude, longitude, magnitude, depth, external_url, occurred_at
       FROM disasters 
       WHERE is_active = true 
       ORDER BY occurred_at DESC`
    );

    const disasters = result.rows;
    const newDisasters = disasters.filter(d => !lastProcessedDisasterIds.has(d.id));

    if (newDisasters.length === 0) {
      console.log('✅ No new disasters found');
      return;
    }

    console.log(`🚨 Found ${newDisasters.length} new disasters!`);

    // Group disasters by country (with improved extraction)
    const disastersByCountry = {};
    for (const disaster of newDisasters) {
      const country = await extractCountryFromDisaster(disaster);
      
      if (!disastersByCountry[country]) {
        disastersByCountry[country] = [];
      }
      
      disastersByCountry[country].push(disaster);
    }

    // Send alerts for each country
    for (const [country, countryDisasters] of Object.entries(disastersByCountry)) {
      console.log(`📤 Sending ${countryDisasters.length} alerts for ${country}...`);

      for (const disaster of countryDisasters) {
        try {
          const subject = formatAlertSubject(disaster, country);
          const message = formatAlertMessage(disaster);

          await publishAlert(country, subject, message, disaster.id);
          console.log(`✅ Alert sent for disaster #${disaster.id} in ${country}`);

          // Add to processed set
          lastProcessedDisasterIds.add(disaster.id);
        } catch (error) {
          console.error(`❌ Failed to send alert for disaster #${disaster.id}:`, error.message);
        }
      }
    }

    console.log(`✅ Processed ${newDisasters.length} new disasters`);
  } catch (error) {
    console.error('❌ Error processing new disasters:', error.message);
  }
};

/**
 * Update SNS topics based on current disaster data
 */
const updateSnsTopics = async () => {
  try {
    console.log('\n🔄 Updating SNS topics...');

    // Get active disasters with coordinates for geocoding
    const result = await query(
      'SELECT id, location_name, latitude, longitude, description FROM disasters WHERE is_active = true'
    );

    const disasters = result.rows;
    const countryCounts = await getCountryCounts(disasters);

    console.log(`📊 Found disasters in ${Object.keys(countryCounts).length} countries`);

    // Update disaster counts and create topics if needed
    for (const [country, count] of Object.entries(countryCounts)) {
      if (country === 'Unknown') continue;

      try {
        // Update count in database (will create topic if needed)
        await updateDisasterCount(country, count);

        // Check if topic exists, create if not
        const topicResult = await query(
          'SELECT topic_arn FROM sns_topics WHERE country = $1',
          [country]
        );

        if (topicResult.rows.length === 0) {
          console.log(`🆕 Creating new topic for ${country}...`);
          await createTopicForCountry(country);
        }
      } catch (error) {
        console.error(`❌ Failed to update topic for ${country}:`, error.message);
      }
    }

    // Mark countries with no disasters
    const activeCountries = Object.keys(countryCounts).filter(c => c !== 'Unknown');
    if (activeCountries.length > 0) {
      await query(
        `UPDATE sns_topics 
         SET disaster_count = 0 
         WHERE country NOT IN (${activeCountries.map((_, i) => `$${i + 1}`).join(',')})`,
        activeCountries
      );
    }

    // Cleanup inactive topics (optional - uncomment to enable)
    // await cleanupInactiveTopics();

    console.log('✅ SNS topics updated');
  } catch (error) {
    console.error('❌ Error updating SNS topics:', error.message);
  }
};

/**
 * Main job function
 */
const runDisasterAlertJob = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚨 DISASTER ALERT JOB STARTED');
  console.log('='.repeat(60));

  try {
    // Update topics first
    await updateSnsTopics();

    // Then process and send alerts for new disasters
    await processNewDisasters();
  } catch (error) {
    console.error('❌ Disaster alert job failed:', error.message);
  }

  console.log('='.repeat(60));
  console.log('✅ DISASTER ALERT JOB COMPLETED');
  console.log('='.repeat(60) + '\n');
};

/**
 * Start the scheduled job
 */
const startDisasterAlertJob = async () => {
  // Initialize with existing disasters
  await initializeProcessedDisasters();

  // Schedule job to run every 10 minutes
  const cronExpression = '*/10 * * * *'; // Every 10 minutes

  cron.schedule(cronExpression, runDisasterAlertJob);

  console.log('📅 Disaster alert job scheduled (every 10 minutes)');
  console.log(`⏰ Next run: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);

  // Run immediately on startup
  setTimeout(() => {
    console.log('🚀 Running disaster alert job immediately...');
    runDisasterAlertJob();
  }, 5000); // Wait 5 seconds after startup
};

/**
 * Run job manually (for testing)
 */
const runNow = async () => {
  await runDisasterAlertJob();
};

module.exports = {
  startDisasterAlertJob,
  runNow,
};

