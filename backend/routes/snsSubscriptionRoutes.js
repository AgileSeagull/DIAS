const express = require('express');
const router = express.Router();
const {
  subscribeToCountry,
  getMySubscriptions,
  getAvailableCountries,
  getTopicsStatus,
  getSubscriptionStats,
  unsubscribeFromCountry,
} = require('../controllers/snsSubscriptionController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/subscribe
 * @desc    Subscribe to country-specific disaster alerts
 * @access  Public
 */
router.post('/', subscribeToCountry);

/**
 * @route   GET /api/subscribe/my-subscriptions
 * @desc    Get user's subscriptions
 * @access  Public (can pass email as query param)
 */
router.get('/my-subscriptions', getMySubscriptions);

/**
 * @route   GET /api/subscribe/countries
 * @desc    Get available countries with active disasters
 * @access  Public
 */
router.get('/countries', getAvailableCountries);

/**
 * @route   GET /api/subscribe/topics
 * @desc    Get SNS topics status
 * @access  Public
 */
router.get('/topics', getTopicsStatus);

/**
 * @route   GET /api/subscribe/stats
 * @desc    Get subscription statistics
 * @access  Public
 */
router.get('/stats', getSubscriptionStats);

/**
 * @route   DELETE /api/subscribe/:id
 * @desc    Unsubscribe from country-specific alerts
 * @access  Public (email required)
 */
router.delete('/:id', unsubscribeFromCountry);

module.exports = router;

