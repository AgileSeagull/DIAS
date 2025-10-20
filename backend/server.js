require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const disasterRoutes = require('./routes/disasterRoutes');
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const dataSyncRoutes = require('./routes/dataSyncRoutes');
const snsSubscriptionRoutes = require('./routes/snsSubscriptionRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(logger); // Request logging
app.use(apiLimiter); // API rate limiting

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DIAS API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/disasters', disasterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/sync', dataSyncRoutes);
app.use('/api/subscribe', snsSubscriptionRoutes);

// Error handling
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Error handler

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║          DIAS Backend Server                          ║
║                                                        ║
║  ✅ Server running on http://localhost:${PORT}      ║
║  ✅ Environment: ${process.env.NODE_ENV || 'development'}                     ║
║                                                        ║
║  📡 API Endpoints:                                    ║
║     GET    /health                                   ║
║     GET    /api/disasters                            ║
║     GET    /api/disasters/:id                        ║
║     GET    /api/disasters/nearby                     ║
║     GET    /api/disasters/stats                      ║
║     POST   /api/auth/register                        ║
║     POST   /api/auth/login                           ║
║     GET    /api/auth/me                              ║
║     POST   /api/subscriptions                        ║
║     GET    /api/subscriptions                        ║
║     PUT    /api/subscriptions/:id                    ║
║         DELETE /api/subscriptions/:id                    ║
    POST   /api/sync/all                              ║
    POST   /api/sync/:type                            ║
    GET    /api/sync/stats                            ║
    GET    /api/sync/status                           ║
    POST   /api/sync/run                              ║
    ╚════════════════════════════════════════════════════════╝
  `);

  // Start sync job (optional - comment out to disable)
  // console.log('Starting background data sync job...');
  // Start scheduled jobs
  const { startSyncJob } = require('./jobs/dataSyncJob');
  startSyncJob('0 */6 * * *'); // Run every 6 hours
  
  const { startDisasterAlertJob } = require('./jobs/disasterAlertJob');
  startDisasterAlertJob(); // Runs every 10 minutes
  
  console.log('\n💡 Tip: Start data sync manually via: POST /api/sync/all');
  console.log('📧 AWS SNS alerts are enabled for country-specific subscriptions');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

