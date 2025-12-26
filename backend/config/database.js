const { Pool } = require("pg");
require("dotenv").config();

// Create connection pool
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	// In Docker, PostgreSQL doesn't support SSL by default for internal connections
	ssl: false,
});

// Test database connection
pool.on("connect", () => {
	console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
	console.error("⚠️  Database connection error:", err.message);
	console.log("To start PostgreSQL, run: sudo systemctl start postgresql");
});

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
	const start = Date.now();
	try {
		const res = await pool.query(text, params);
		const duration = Date.now() - start;
		console.log("Executed query", { text, duration, rows: res.rowCount });
		return res;
	} catch (error) {
		console.error("Query error:", { text, params, error: error.message });
		throw error;
	}
};

/**
 * Get a client from the pool
 * @returns {Promise} Database client
 */
const getClient = async () => {
	const client = await pool.connect();
	const query = client.query;
	const release = client.release;

	// Set a timeout for the client query
	const timeout = setTimeout(() => {
		console.error("A client has been checked out for more than 5 seconds!");
		console.error(
			`The last executed query on this client was: ${client.lastQuery}`
		);
	}, 5000);

	// Override the query method to log the last query
	client.query = (...args) => {
		client.lastQuery = args;
		return query.apply(client, args);
	};

	client.release = () => {
		clearTimeout(timeout);
		client.query = query;
		client.release = release;
		return release.apply(client);
	};

	return client;
};

module.exports = {
	query,
	getClient,
	pool,
};
