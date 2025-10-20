const { query } = require('../config/database');

/**
 * Get all disasters with optional filters
 * GET /api/disasters
 */
const getDisasters = async (req, res, next) => {
  try {
    const {
      type,
      severity,
      min_severity,
      start_date,
      end_date,
      lat,
      lng,
      radius_km,
      limit = 100,
      offset = 0,
    } = req.query;

    let sql = 'SELECT * FROM disasters WHERE is_active = true';
    const params = [];
    let paramIndex = 1;

    // Filter by type
    if (type) {
      sql += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Filter by severity
    if (severity) {
      sql += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    // Filter by minimum severity
    if (min_severity) {
      const severityOrder = ['low', 'moderate', 'high', 'critical'];
      const minIndex = severityOrder.indexOf(min_severity);
      if (minIndex !== -1) {
        const severities = severityOrder.slice(minIndex);
        sql += ` AND severity = ANY($${paramIndex})`;
        params.push(severities);
        paramIndex++;
      }
    }

    // Filter by date range
    if (start_date) {
      sql += ` AND occurred_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      sql += ` AND occurred_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    // Order by occurred_at (most recent first)
    sql += ' ORDER BY occurred_at DESC';

    // Add pagination
    sql += ` LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    paramIndex++;
    sql += ` OFFSET $${paramIndex}`;
    params.push(parseInt(offset));

    const result = await query(sql, params);
    
    // If location-based filtering is requested
    let disasters = result.rows;
    if (lat && lng && radius_km) {
      disasters = filterByDistance(disasters, parseFloat(lat), parseFloat(lng), parseInt(radius_km));
    }

    res.json({
      success: true,
      count: disasters.length,
      data: disasters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single disaster by ID
 * GET /api/disasters/:id
 */
const getDisasterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM disasters WHERE id = $1 AND is_active = true', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get disasters near a location
 * GET /api/disasters/nearby
 */
const getNearbyDisasters = async (req, res, next) => {
  try {
    const { lat, lng, radius_km = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const result = await query(
      `SELECT *, 
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance_km
       FROM disasters 
       WHERE is_active = true
       HAVING distance_km <= $3
       ORDER BY distance_km ASC
       LIMIT 20`,
      [parseFloat(lat), parseFloat(lng), parseInt(radius_km)]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get disaster statistics
 * GET /api/disasters/stats
 */
const getDisasterStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let sql = `
      SELECT 
        type,
        severity,
        COUNT(*) as count
      FROM disasters 
      WHERE is_active = true
    `;
    const params = [];
    let paramIndex = 1;

    if (start_date) {
      sql += ` AND occurred_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      sql += ` AND occurred_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    sql += ' GROUP BY type, severity ORDER BY type, severity';

    const result = await query(sql, params);

    // Format statistics
    const stats = {};
    result.rows.forEach((row) => {
      if (!stats[row.type]) {
        stats[row.type] = {};
      }
      stats[row.type][row.severity] = parseInt(row.count);
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to filter disasters by distance
 */
const filterByDistance = (disasters, lat, lng, radiusKm) => {
  return disasters.filter(disaster => {
    const distance = calculateDistance(lat, lng, disaster.latitude, disaster.longitude);
    return distance <= radiusKm;
  });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => degrees * (Math.PI / 180);

module.exports = {
  getDisasters,
  getDisasterById,
  getNearbyDisasters,
  getDisasterStats,
};

