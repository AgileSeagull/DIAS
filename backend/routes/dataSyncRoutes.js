const express = require("express");
const router = express.Router();
const {
	fetchAllDisasterData,
	fetchDisasterDataByType,
	getAllDisasterStats,
} = require("../services/disasterDataFetcher");
const { runSyncNow, getSyncJobStatus } = require("../jobs/dataSyncJob");
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/sync/all
 * @desc    Trigger manual sync of all disaster data sources
 * @access  Private (Admin only - can be made public for demo)
 */
router.post("/all", async (req, res, next) => {
	try {
		console.log("Manual sync triggered via API");
		const result = await fetchAllDisasterData();

		res.json({
			success: true,
			message: "Disaster data sync completed",
			data: result,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   POST /api/sync/:type
 * @desc    Trigger sync for specific disaster type
 * @access  Private
 */
router.post("/:type", async (req, res, next) => {
	try {
		const { type } = req.params;

		if (!["earthquake", "flood", "fire", "cyclone"].includes(type)) {
			return res.status(400).json({
				success: false,
				message:
					"Invalid disaster type. Must be: earthquake, flood, fire, or cyclone",
			});
		}

		console.log(`Manual sync triggered for ${type}`);
		const result = await fetchDisasterDataByType(type);

		if (result.success) {
			res.json({
				success: true,
				message: `${type} data sync completed`,
				data: result,
			});
		} else {
			res.status(500).json({
				success: false,
				message: `Failed to sync ${type} data`,
				error: result.error,
			});
		}
	} catch (error) {
		next(error);
	}
});

/**
 * @route   GET /api/sync/stats
 * @desc    Get statistics for all disaster types
 * @access  Public
 */
router.get("/stats", async (req, res, next) => {
	try {
		const stats = await getAllDisasterStats();

		res.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   GET /api/sync/status
 * @desc    Get sync job status
 * @access  Public
 */
router.get("/status", (req, res) => {
	const status = getSyncJobStatus();

	res.json({
		success: true,
		data: status,
	});
});

/**
 * @route   POST /api/sync/run
 * @desc    Run sync job now (one-time)
 * @access  Private
 */
router.post("/run", async (req, res, next) => {
	try {
		console.log("Manual sync job triggered");
		const result = await runSyncNow();

		res.json({
			success: true,
			message: "Sync job completed",
			data: result,
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;
