import L from 'leaflet';

/**
 * Create custom icon for disaster markers
 * @param {string} type - Type of disaster (earthquake, flood, fire, cyclone)
 * @param {string} severity - Severity level (low, moderate, high, critical)
 * @returns {L.Icon} Leaflet icon object
 */
export const createDisasterIcon = (type, severity) => {
  const size = getSizeBySeverity(severity);
  const color = getColorByType(type);
  
  return L.divIcon({
    className: 'custom-disaster-marker',
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.4}px;
      ">
        ${getEmojiForType(type)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

/**
 * Get size based on severity
 */
const getSizeBySeverity = (severity) => {
  const sizes = {
    low: 20,
    moderate: 28,
    high: 36,
    critical: 44,
  };
  return sizes[severity] || 28;
};

/**
 * Get color based on disaster type
 */
const getColorByType = (type) => {
  const colors = {
    earthquake: '#EF4444',
    flood: '#3B82F6',
    fire: '#F97316',
    cyclone: '#8B5CF6',
  };
  return colors[type] || '#6B7280';
};

/**
 * Get emoji for disaster type
 */
const getEmojiForType = (type) => {
  const emojis = {
    earthquake: '🌋',
    flood: '🌊',
    fire: '🔥',
    cyclone: '🌪️',
  };
  return emojis[type] || '⚠️';
};

/**
 * Create icon for specific disaster with all details
 */
export const createCustomDisasterIcon = (disaster) => {
  const size = getSizeBySeverity(disaster.severity);
  const color = getColorByType(disaster.type);
  
  return L.divIcon({
    className: 'custom-disaster-marker',
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.45}px;
        cursor: pointer;
        transition: all 0.3s ease;
      " class="disaster-marker" data-type="${disaster.type}" data-severity="${disaster.severity}">
        ${getEmojiForType(disaster.type)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

/**
 * Get CSS class for disaster type badge
 */
export const getDisasterBadgeClass = (type) => {
  const classes = {
    earthquake: 'bg-red-100 text-red-800 border-red-300',
    flood: 'bg-blue-100 text-blue-800 border-blue-300',
    fire: 'bg-orange-100 text-orange-800 border-orange-300',
    cyclone: 'bg-purple-100 text-purple-800 border-purple-300',
  };
  return classes[type] || 'bg-gray-100 text-gray-800 border-gray-300';
};

/**
 * Get CSS class for severity badge
 */
export const getSeverityBadgeClass = (severity) => {
  const classes = {
    low: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return classes[severity] || 'bg-gray-100 text-gray-800';
};

