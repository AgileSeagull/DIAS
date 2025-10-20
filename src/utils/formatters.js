import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format disaster magnitude
 */
export const formatMagnitude = (magnitude, type) => {
  if (type === 'earthquake') {
    return `M ${magnitude}`;
  }
  if (type === 'cyclone') {
    return `Category ${magnitude}`;
  }
  return magnitude;
};

/**
 * Format relative time
 */
export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format absolute date
 */
export const formatDate = (date, formatStr = 'PPpp') => {
  return format(new Date(date), formatStr);
};

/**
 * Get disaster icon
 */
export const getDisasterIcon = (type) => {
  const icons = {
    earthquake: '🌋',
    flood: '🌊',
    fire: '🔥',
    cyclone: '🌪️',
  };
  return icons[type] || '⚠️';
};

/**
 * Get disaster color
 */
export const getDisasterColor = (type) => {
  const colors = {
    earthquake: '#EF4444',
    flood: '#3B82F6',
    fire: '#F97316',
    cyclone: '#8B5CF6',
  };
  return colors[type] || '#6B7280';
};

/**
 * Get severity level
 */
export const getSeverityLevel = (value, thresholds = { high: 70, moderate: 40, low: 0 }) => {
  if (value >= thresholds.high) return 'high';
  if (value >= thresholds.moderate) return 'moderate';
  return 'low';
};

