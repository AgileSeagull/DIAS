import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiX, FiFilter, FiSearch, FiMapPin, FiAlertCircle, 
  FiClock, FiGlobe, FiZoomIn, FiCrosshair,
  FiShare2, FiExternalLink, FiLayers
} from 'react-icons/fi';
import { createCustomDisasterIcon, getDisasterBadgeClass, getSeverityBadgeClass } from '../utils/mapIcons';
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Filter helper functions
const filterByType = (disasters, type) => {
  if (type === 'all') return disasters;
  return disasters.filter(d => d.type === type);
};

const filterBySeverity = (disasters, severity) => {
  if (severity === 'low') return disasters;
  const severities = ['low', 'moderate', 'high', 'critical'];
  const severityIndex = severities.indexOf(severity);
  return disasters.filter(d => {
    const disasterSeverityIndex = severities.indexOf(d.severity);
    return disasterSeverityIndex >= severityIndex;
  });
};

const filterByTime = (disasters, hours) => {
  if (!hours) return disasters;
  const now = new Date();
  const cutoff = new Date(now - hours * 60 * 60 * 1000);
  return disasters.filter(d => new Date(d.timestamp) >= cutoff);
};

const countByType = (disasters) => {
  const counts = { earthquake: 0, flood: 0, fire: 0, cyclone: 0, all: disasters.length };
  disasters.forEach(d => {
    if (counts[d.type] !== undefined) counts[d.type]++;
  });
  return counts;
};

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const DisasterMap = ({ disasters, isLoading }) => {
  const [filteredDisasters, setFilteredDisasters] = useState(disasters || []);
  const [panelOpen, setPanelOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    severity: 'low',
    timeRange: null,
  });
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [center, setCenter] = useState([20, 0]);
  const [zoom, setZoom] = useState(3);
  const mapRef = useRef(null);

  const [disasterTypes] = useState([
    { value: 'all', label: 'All Disasters', color: '#6B7280' },
    { value: 'earthquake', label: '🌋 Earthquakes', color: '#EF4444' },
    { value: 'flood', label: '🌊 Floods', color: '#3B82F6' },
    { value: 'fire', label: '🔥 Wildfires', color: '#F97316' },
    { value: 'cyclone', label: '🌪️ Cyclones', color: '#8B5CF6' },
  ]);

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'moderate', label: 'Moderate', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'critical', label: 'Critical', color: 'red' },
  ];

  const timeRanges = [
    { value: 1, label: 'Last Hour' },
    { value: 6, label: 'Last 6 Hours' },
    { value: 24, label: 'Last 24 Hours' },
    { value: 168, label: 'Last 7 Days' },
  ];

  // Update filtered disasters when filters or disasters change
  useEffect(() => {
    let filtered = [...disasters];
    
    // Filter by type
    if (activeFilters.type !== 'all') {
      filtered = filterByType(filtered, activeFilters.type);
    }
    
    // Filter by severity
    filtered = filterBySeverity(filtered, activeFilters.severity);
    
    // Filter by time
    if (activeFilters.timeRange) {
      filtered = filterByTime(filtered, activeFilters.timeRange);
    }
    
    setFilteredDisasters(filtered);
  }, [disasters, activeFilters]);

  const handleTypeFilter = (type) => {
    setActiveFilters(prev => ({ ...prev, type }));
  };

  const handleSeverityFilter = (severity) => {
    setActiveFilters(prev => ({ ...prev, severity }));
  };

  const handleTimeFilter = (hours) => {
    setActiveFilters(prev => ({ 
      ...prev, 
      timeRange: hours === prev.timeRange ? null : hours 
    }));
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCenter([latitude, longitude]);
        setZoom(10);
      });
    }
  };

  const handleResetView = () => {
    setCenter([20, 0]);
    setZoom(3);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const input = e.target.search.value;
    // TODO: Implement geocoding
    console.log('Searching for:', input);
  };

  const countsByType = countByType(filteredDisasters);

  const renderPopup = (disaster) => (
    <Popup className="custom-popup" maxWidth={320}>
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{disaster.type === 'earthquake' ? '🌋' : disaster.type === 'flood' ? '🌊' : disaster.type === 'fire' ? '🔥' : '🌪️'}</span>
            <div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getDisasterBadgeClass(disaster.type)}`}>
                {disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}
              </div>
              <div className={`inline-block ml-2 px-2 py-1 rounded text-xs font-semibold ${getSeverityBadgeClass(disaster.severity)}`}>
                {disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1)}
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 mb-2">{disaster.location}</h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-2">
            <FiMapPin className="w-4 h-4" />
            <span>{disaster.lat.toFixed(3)}, {disaster.lng.toFixed(3)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="w-4 h-4" />
            <span>Magnitude: {disaster.magnitude}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiClock className="w-4 h-4" />
            <span>{formatDistanceToNow(disaster.timestamp, { addSuffix: true })}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 mb-3">{disaster.description}</p>
        
        <div className="flex gap-2 mt-3">
          {disaster.external_url && (
            <a
              href={disaster.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-white">View Details</span>
              <FiExternalLink className="w-4 h-4 text-white" />
            </a>
          )}
          <button
            onClick={() => {
              // Share functionality - copy map location to clipboard
              const mapUrl = `https://www.google.com/maps?q=${disaster.lat},${disaster.lng}`;
              navigator.clipboard.writeText(mapUrl);
              alert('Map location copied to clipboard!');
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors"
            title="Share location"
          >
            <FiShare2 />
          </button>
        </div>
      </div>
    </Popup>
  );

  return (
    <div className="relative w-full h-screen">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 z-[1000] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Layer Control Panel */}
      {panelOpen && (
        <div className="absolute left-4 z-[1000] bg-white rounded-lg shadow-xl w-80 max-h-[calc(100vh-200px)] overflow-y-auto" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <FiFilter />
              <span>Filters</span>
            </h2>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Disaster Type Filters */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Disaster Type</h3>
            <div className="space-y-2">
              {disasterTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeFilter(type.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeFilters.type === type.value
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{type.label}</span>
                    {countsByType[type.value] !== undefined && (
                      <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                        {countsByType[type.value]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum Severity</h3>
            <div className="space-y-2">
              {severityLevels.map((sev) => (
                <button
                  key={sev.value}
                  onClick={() => handleSeverityFilter(sev.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeFilters.severity === sev.value
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <span className="capitalize">{sev.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Time Range</h3>
            <div className="space-y-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleTimeFilter(range.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeFilters.timeRange === range.value
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Combined Stats & Legend Panel - Bottom right */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-xl p-4 max-w-[200px]">
        <div className="space-y-3">
          {/* Stats Section */}
          <div>
            <div className="font-bold text-gray-900 text-sm mb-2">Stats</div>
            <div className="text-gray-700 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Total:</span>
                <span className="font-semibold text-blue-600">{filteredDisasters.length}</span>
              </div>
              {Object.entries(countsByType).slice(0, 3).map(([type, count]) => (
                <div key={type} className="flex justify-between text-xs">
                  <span>{type === 'earthquake' ? '🌋' : type === 'flood' ? '🌊' : type === 'fire' ? '🔥' : '🌪️'}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-200"></div>
          
          {/* Legend Section */}
          <div>
            <div className="text-xs font-bold text-gray-900 mb-2">Legend</div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Earthquake</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Flood</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Fire</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Cyclone</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls - Horizontal */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 flex space-x-2">
        <button
          onClick={handleLocationClick}
          className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Get my location"
        >
          <FiCrosshair className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 flex items-center justify-center bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          title="Reset view"
        >
          <FiGlobe className="w-5 h-5" />
        </button>
        <button
          onClick={() => setClusteringEnabled(!clusteringEnabled)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
            clusteringEnabled 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
          }`}
          title={clusteringEnabled ? "Disable clustering (show all markers)" : "Enable clustering (group nearby markers)"}
        >
          <FiLayers className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Toggle filters"
        >
          <FiFilter className="w-5 h-5" />
        </button>
      </div>


      {/* Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        ref={mapRef}
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {clusteringEnabled ? (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={true}
          >
            {filteredDisasters.map((disaster) => (
              <Marker
                key={disaster.id}
                position={[disaster.lat, disaster.lng]}
                icon={createCustomDisasterIcon(disaster)}
              >
                {renderPopup(disaster)}
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          <>
            {filteredDisasters.map((disaster) => (
              <Marker
                key={disaster.id}
                position={[disaster.lat, disaster.lng]}
                icon={createCustomDisasterIcon(disaster)}
              >
                {renderPopup(disaster)}
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default DisasterMap;

