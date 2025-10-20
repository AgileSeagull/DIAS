const Joi = require('joi');

/**
 * Request validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  subscription: Joi.object({
    location_name: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radius_km: Joi.number().min(1).max(500).default(50),
    disaster_types: Joi.array().items(Joi.string().valid('earthquake', 'flood', 'fire', 'cyclone')).default([]),
    min_severity: Joi.string().valid('low', 'moderate', 'high', 'critical').default('low'),
    notification_methods: Joi.array().items(Joi.string().valid('sms', 'email', 'push')).default([]),
    is_active: Joi.boolean().default(true),
  }),
};

module.exports = {
  validate,
  schemas,
};

