const axios = require("axios");
const { query } = require("../config/database");
const {
	transformEarthquake,
	filterValidDisasters,
	removeDuplicates,
} = require("../utils/dataTransformer");

const API_URL =
	"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
const MIN_MAGNITUDE = 2.5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Fetch earthquake data from USGS API
 * @returns {Promise<object>} Result with count and message
 */
const fetchEarthquakeData = async () => {
	let retries = MAX_RETRIES;
	let lastError = null;

	while (retries > 0) {
		try {
			console.log("Fetching earthquake data from USGS...");

			const response = await axios.get(API_URL, {
				timeout: 10000,
				headers: {
					"User-Agent": "DIAS-Disaster-Information-System/1.0",
				},
			});

			const earthquakes = response.data.features || [];
			console.log(
				`Found ${earthquakes.length} earthquakes (last 24 hours)`
			);

			// Filter by magnitude
			const filteredQuakes = earthquakes.filter(
				(event) => event.properties.mag >= MIN_MAGNITUDE
			);
			console.log(
				`${filteredQuakes.length} earthquakes meet magnitude >= ${MIN_MAGNITUDE}`
			);

			// Transform data
			const transformedQuakes = filteredQuakes
				.map((event) => transformEarthquake(event, `usgs-${event.id}`))
				.filter(Boolean);

			// Remove duplicates
			const uniqueQuakes = removeDuplicates(transformedQuakes);
			const validQuakes = filterValidDisasters(uniqueQuakes);

			console.log(
				`Processing ${validQuakes.length} valid earthquakes...`
			);

			// Store in database with upsert logic
			let newCount = 0;
			let updatedCount = 0;

			for (const quake of validQuakes) {
				try {
					const existing = await query(
						"SELECT id FROM disasters WHERE disaster_id = $1",
						[quake.disaster_id]
					);

					if (existing.rows.length > 0) {
						// Update existing record
						await query(
							`UPDATE disasters 
               SET type = $2, severity = $3, title = $4, description = $5, 
                   location_name = $6, latitude = $7, longitude = $8, 
                   magnitude = $9, depth = $10, source = $11, 
                   external_url = $12, occurred_at = $13, updated_at = CURRENT_TIMESTAMP
               WHERE disaster_id = $1`,
							[
								quake.disaster_id,
								quake.type,
								quake.severity,
								quake.title,
								quake.description,
								quake.location_name,
								quake.latitude,
								quake.longitude,
								quake.magnitude,
								quake.depth,
								quake.source,
								quake.external_url,
								quake.occurred_at,
							]
						);
						updatedCount++;
					} else {
						// Insert new record
						await query(
							`INSERT INTO disasters (
                disaster_id, type, severity, title, description, location_name,
                latitude, longitude, magnitude, depth, source, external_url, occurred_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
							[
								quake.disaster_id,
								quake.type,
								quake.severity,
								quake.title,
								quake.description,
								quake.location_name,
								quake.latitude,
								quake.longitude,
								quake.magnitude,
								quake.depth,
								quake.source,
								quake.external_url,
								quake.occurred_at,
							]
						);
						newCount++;
					}
				} catch (err) {
					console.error(
						`Failed to save earthquake ${quake.disaster_id}:`,
						err.message
					);
				}
			}

			console.log(
				`Earthquakes processed: ${newCount} new, ${updatedCount} updated`
			);

			return {
				success: true,
				type: "earthquake",
				new: newCount,
				updated: updatedCount,
				total: validQuakes.length,
				message: `Successfully processed ${validQuakes.length} earthquakes (${newCount} new, ${updatedCount} updated)`,
			};
		} catch (error) {
			lastError = error;
			retries--;

			if (retries > 0) {
				console.warn(
					`⚠️  API call failed, retrying... (${retries} retries left)`
				);
				await new Promise((resolve) =>
					setTimeout(resolve, RETRY_DELAY)
				);
			}
		}
	}

	console.error(
		"Failed to fetch earthquake data after retries:",
		lastError.message
	);
	return {
		success: false,
		type: "earthquake",
		error: lastError.message,
		message: "Failed to fetch earthquake data",
	};
};

/**
 * Get earthquake statistics
 * @returns {Promise<object>} Statistics
 */
const getEarthquakeStats = async () => {
	try {
		const result = await query(
			`SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
        COUNT(CASE WHEN severity = 'moderate' THEN 1 END) as moderate,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low,
        MAX(magnitude) as max_magnitude,
        AVG(magnitude) as avg_magnitude
       FROM disasters 
       WHERE type = 'earthquake' AND is_active = true`
		);

		return {
			success: true,
			data: result.rows[0],
		};
	} catch (error) {
		return {
			success: false,
			error: error.message,
		};
	}
};

module.exports = {
	fetchEarthquakeData,
	getEarthquakeStats,
};
