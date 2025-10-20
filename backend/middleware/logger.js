/**
 * Request logging middleware
 */
const logger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    // Add query params if present
    if (Object.keys(req.query).length > 0) {
      log.query = req.query;
    }

    // Add user info if authenticated
    if (req.user) {
      log.user = req.user.id;
    }

    // Color code based on status
    if (res.statusCode >= 500) {
      console.error('❌', log);
    } else if (res.statusCode >= 400) {
      console.warn('⚠️', log);
    } else {
      console.log('✅', log);
    }
  });

  next();
};

module.exports = logger;

