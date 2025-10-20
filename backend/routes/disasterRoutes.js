const express = require('express');
const router = express.Router();
const {
  getDisasters,
  getDisasterById,
  getNearbyDisasters,
  getDisasterStats,
} = require('../controllers/disasterController');
const { optionalAuth } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/disasters
 * @desc    Get all disasters with optional filters
 * @access  Public
 * @query   type, severity, min_severity, start_date, end_date, lat, lng, radius_km, limit, offset
 */
router.get('/', optionalAuth, getDisasters);

/**
 * @route   GET /api/disasters/nearby
 * @desc    Get disasters near a location
 * @access  Public
 * @query   lat, lng, radius_km (optional, default 50)
 */
router.get('/nearby', getNearbyDisasters);

/**
 * @route   GET /api/disasters/stats
 * @desc    Get disaster statistics by type and severity
 * @access  Public
 * @query   start_date, end_date (optional)
 */
router.get('/stats', getDisasterStats);

/**
 * @route   GET /api/disasters/:id
 * @desc    Get a single disaster by ID
 * @access  Public
 */
router.get('/:id', getDisasterById);

module.exports = router;

