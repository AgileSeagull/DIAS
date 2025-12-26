const {
	subscribeEmailToCountry,
	getAllTopics,
	publishWelcomeEmail,
	unsubscribeEmail,
} = require("../services/awsSnsService");
const { query } = require("../config/database");

/**
 * Send welcome email with current disasters
 */
const sendWelcomeEmail = async (email, country, disasters, topicArn) => {
	const disasterCount = disasters.length;

	let message = `Thank you for subscribing to disaster alerts for ${country}!\n\n`;
	message += `You will receive real-time notifications when new disasters occur in this region.\n\n`;

	if (disasterCount > 0) {
		message += `CURRENTLY ACTIVE DISASTERS IN ${country.toUpperCase()}:\n`;
		message += `${"=".repeat(60)}\n\n`;

		disasters.forEach((disaster, index) => {
			const emoji =
				{
					earthquake: "🌋",
					flood: "🌊",
					fire: "🔥",
					cyclone: "🌪️",
				}[disaster.type] || "⚠️";

			message += `${emoji} ${disaster.type.toUpperCase()} - ${disaster.severity.toUpperCase()}\n`;
			message += `   Location: ${disaster.location_name}\n`;

			if (disaster.magnitude) {
				message += `   Magnitude: ${disaster.magnitude}\n`;
			}

			message += `   Time: ${new Date(
				disaster.occurred_at
			).toLocaleString()}\n`;

			if (disaster.description) {
				message += `   Details: ${disaster.description.substring(
					0,
					100
				)}${disaster.description.length > 100 ? "..." : ""}\n`;
			}

			message += `   Coordinates: ${disaster.latitude}, ${disaster.longitude}\n`;

			if (disaster.external_url) {
				message += `   More Info: ${disaster.external_url}\n`;
			}

			message += "\n";

			if (index < disasters.length - 1) {
				message += `${"-".repeat(60)}\n\n`;
			}
		});

		message += `${"=".repeat(60)}\n\n`;
		message += `You will receive alerts for any new disasters that occur.\n\n`;
	} else {
		message += `No active disasters in ${country} at the moment.\n\n`;
		message += `You will be notified when new disasters are detected.\n\n`;
	}

	message += `To unsubscribe, click the unsubscribe link in any alert email.\n\n`;
	message += `---\n`;
	message += `DIAS - Disaster Information & Alert System\n`;
	message += `Stay safe and informed!\n`;

	const subject =
		disasterCount > 0
			? `Welcome! ${disasterCount} Active Disaster${
					disasterCount > 1 ? "s" : ""
			  } in ${country}`
			: `Welcome to Disaster Alerts for ${country}`;

	await publishWelcomeEmail(topicArn, subject, message);
};

/**
 * Subscribe user to country-specific disaster alerts
 * POST /api/subscribe
 */
const subscribeToCountry = async (req, res, next) => {
	try {
		const { email, country } = req.body;

		if (!email || !country) {
			return res.status(400).json({
				success: false,
				message: "Email and country are required",
			});
		}

		// Get user ID if authenticated
		const userId = req.user?.id || null;

		// Get current disasters for this country
		const disastersResult = await query(
			`SELECT type, severity, title, description, location_name, 
              latitude, longitude, magnitude, occurred_at, external_url
       FROM disasters 
       WHERE is_active = true 
         AND (location_name LIKE $1 OR location_name ILIKE $2)
       ORDER BY occurred_at DESC 
       LIMIT 20`,
			[`%${country}%`, `%, ${country}%`]
		);

		const currentDisasters = disastersResult.rows;

		// Subscribe to SNS topic
		const result = await subscribeEmailToCountry(email, country, userId);

		// Always send welcome email (even if no current disasters)
		try {
			console.log(`Preparing to send welcome email for ${country}`);
			await sendWelcomeEmail(
				email,
				country,
				currentDisasters,
				result.topicArn
			);
			console.log(`Welcome email queued for ${email}`);
		} catch (err) {
			console.error("Failed to send welcome email:", err.message);
			// Don't fail the subscription if welcome email fails
		}

		res.json({
			success: true,
			message: result.message,
			data: {
				email,
				country,
				status: "pending_confirmation",
				active_disasters: currentDisasters.length,
			},
		});
	} catch (error) {
		console.error("Error subscribing to country:", error);
		next(error);
	}
};

/**
 * Get user's subscriptions
 * GET /api/subscribe/my-subscriptions
 */
const getMySubscriptions = async (req, res, next) => {
	try {
		// Safely get user info (auth middleware is now optional)
		const userIdDoc = req.user && req.user.id ? req.user.id : null;
		const userEmail =
			req.user && req.user.email
				? req.user.email
				: req.query.email || null;

		// If user is authenticated, get subscriptions by user_id OR email
		let result;
		if (userIdDoc) {
			result = await query(
				`SELECT id, email, country, status, subscribed_at, confirmed_at 
         FROM email_subscriptions 
         WHERE user_id = $1 
         ORDER BY subscribed_at DESC`,
				[userIdDoc]
			);
		} else if (userEmail) {
			// For guests, get by email from query parameter
			result = await query(
				`SELECT id, email, country, status, subscribed_at, confirmed_at 
         FROM email_subscriptions 
         WHERE email = $1 
         ORDER BY subscribed_at DESC`,
				[userEmail]
			);
		} else {
			// No user info available
			return res.json({
				success: true,
				data: [],
				message:
					"Provide email as query parameter or login to see subscriptions.",
			});
		}

		res.json({
			success: true,
			data: result.rows,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get all available countries with active disasters
 * GET /api/subscribe/countries
 */
const getAvailableCountries = async (req, res, next) => {
	try {
		// Get countries from active disasters
		const { extractCountry } = require("../utils/countryExtractor");

		const result = await query(
			`SELECT DISTINCT location_name, latitude, longitude
       FROM disasters 
       WHERE is_active = true
       ORDER BY location_name`
		);

		// Extract unique countries
		const countriesSet = new Set();

		for (const disaster of result.rows) {
			const country = await extractCountry(
				disaster.location_name,
				disaster.latitude,
				disaster.longitude
			);

			// Only include valid country names (not descriptions or long text)
			const isValidCountry =
				country &&
				country !== "Unknown" &&
				country.length < 50 && // Country names shouldn't be too long
				country.length > 2 && // Too short names are likely abbreviations
				!country.toLowerCase().includes("alert") &&
				!country.toLowerCase().includes("tropical") &&
				!country.toLowerCase().includes("category") &&
				!country.toLowerCase().includes("population") &&
				!country.toLowerCase().includes("km/h") &&
				!country.toLowerCase().includes("wind speed") &&
				!country.toLowerCase().includes("drought") &&
				!country.toLowerCase().includes("is on") &&
				!country.toLowerCase().includes("going in") &&
				!country.toLowerCase().includes("affected by") &&
				!country.toLowerCase().includes("pacific rise") &&
				!country.toLowerCase().includes("ridge") &&
				!country.toLowerCase().includes("ocean") &&
				!country.toLowerCase().includes("sea") &&
				!country.match(/^\d/) && // Don't start with numbers
				!country.match(/^(north|south|east|west|central)\s/i) && // Don't include directional prefixes alone
				!country.match(/\s(is|in|on|by|the)\s/i); // Don't include sentences

			if (isValidCountry) {
				countriesSet.add(country);
			}
		}

		// Convert to array and sort
		const countries = Array.from(countriesSet)
			.sort()
			.map((country) => ({
				country,
				disaster_count: result.rows.filter((d) => {
					// Count disasters for this country (simplified)
					return d.location_name.includes(country);
				}).length,
			}));

		res.json({
			success: true,
			data: countries,
			message:
				countries.length === 0
					? "No countries with active disasters. Please sync disaster data first."
					: undefined,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get SNS topics status
 * GET /api/subscribe/topics
 */
const getTopicsStatus = async (req, res, next) => {
	try {
		const topics = await getAllTopics();

		res.json({
			success: true,
			data: topics,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get subscription statistics
 * GET /api/subscribe/stats
 */
const getSubscriptionStats = async (req, res, next) => {
	try {
		const stats = await query(
			`SELECT 
         COUNT(DISTINCT country) as countries_count,
         COUNT(*) as total_subscriptions,
         COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_subscriptions,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_subscriptions
       FROM email_subscriptions`
		);

		const topCountries = await query(
			`SELECT country, COUNT(*) as subscriber_count
       FROM email_subscriptions
       WHERE status = 'confirmed'
       GROUP BY country
       ORDER BY subscriber_count DESC
       LIMIT 10`
		);

		res.json({
			success: true,
			data: {
				...stats.rows[0],
				top_countries: topCountries.rows,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Unsubscribe from country-specific disaster alerts
 * DELETE /api/subscribe/:id
 */
const unsubscribeFromCountry = async (req, res, next) => {
	try {
		const { id } = req.params;
		const userEmail = req.query.email || (req.user && req.user.email);

		if (!userEmail) {
			return res.status(400).json({
				success: false,
				message:
					"Email is required. Provide it as a query parameter or login.",
			});
		}

		// Get the subscription
		const subResult = await query(
			`SELECT id, email, country, subscription_arn 
       FROM email_subscriptions 
       WHERE id = $1 AND email = $2`,
			[id, userEmail]
		);

		if (subResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Subscription not found",
			});
		}

		const subscription = subResult.rows[0];

		// Unsubscribe from AWS SNS
		if (
			subscription.subscription_arn &&
			subscription.subscription_arn !== "pending confirmation"
		) {
			try {
				await unsubscribeEmail(subscription.subscription_arn);
			} catch (error) {
				console.error(
					"Failed to unsubscribe from SNS (continuing anyway):",
					error.message
				);
			}
		}

		// Update status in database
		await query(
			`UPDATE email_subscriptions 
       SET status = 'unsubscribed', subscription_arn = NULL 
       WHERE id = $1`,
			[id]
		);

		console.log(
			`🗑️ Unsubscribed ${userEmail} from ${subscription.country}`
		);

		res.json({
			success: true,
			message: `Successfully unsubscribed from ${subscription.country} alerts`,
		});
	} catch (error) {
		console.error("Error unsubscribing:", error);
		next(error);
	}
};

module.exports = {
	subscribeToCountry,
	getMySubscriptions,
	getAvailableCountries,
	getTopicsStatus,
	getSubscriptionStats,
	unsubscribeFromCountry,
};
