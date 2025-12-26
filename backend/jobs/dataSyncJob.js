/**
 * Scheduled job to sync disaster data from external APIs
 * Runs every hour by default
 */

const cron = require("node-cron");
const { fetchAllDisasterData } = require("../services/disasterDataFetcher");

let syncJob = null;

/**
 * Start the scheduled sync job
 * @param {string} schedule - Cron schedule (default: '0 * * * *' = every hour)
 */
const startSyncJob = (schedule = "0 * * * *") => {
	console.log(`Starting scheduled data sync job (${schedule})...`);

	syncJob = cron.schedule(schedule, async () => {
		console.log("\nScheduled disaster data sync triggered...");

		try {
			const result = await fetchAllDisasterData();
			console.log("Scheduled sync completed successfully");

			if (!result.success) {
				console.warn("⚠️  Some sources failed during scheduled sync");
			}
		} catch (error) {
			console.error("Scheduled sync failed:", error.message);
		}
	});

	console.log("Sync job started successfully");
	return syncJob;
};

/**
 * Run the sync job immediately (once)
 * @returns {Promise<object>} Result
 */
const runSyncNow = async () => {
	console.log("Running sync job now...");
	return await fetchAllDisasterData();
};

/**
 * Stop the scheduled sync job
 */
const stopSyncJob = () => {
	if (syncJob) {
		syncJob.stop();
		console.log("⏹️  Sync job stopped");
	}
};

/**
 * Get sync job status
 * @returns {object} Status
 */
const getSyncJobStatus = () => {
	return {
		running: syncJob ? syncJob.running : false,
	};
};

module.exports = {
	startSyncJob,
	runSyncNow,
	stopSyncJob,
	getSyncJobStatus,
};
