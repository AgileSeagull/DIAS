import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;

// API service functions
export const disasterAPI = {
  // Get all disasters
  getAllDisasters: async (filters = {}) => {
    const response = await apiClient.get('/api/disasters', { params: filters });
    return response.data.data;
  },

  // Get single disaster
  getDisasterById: async (id) => {
    const response = await apiClient.get(`/api/disasters/${id}`);
    return response.data.data;
  },

  // Get nearby disasters
  getNearbyDisasters: async (lat, lng, radiusKm = 100) => {
    const response = await apiClient.get('/api/disasters/nearby', {
      params: { lat, lng, radius_km: radiusKm }
    });
    return response.data.data;
  },

  // Get disaster statistics
  getStats: async () => {
    const response = await apiClient.get('/api/disasters/stats');
    return response.data.data;
  },

  // Sync data
  syncDisasters: async (type = 'all') => {
    const response = await apiClient.post(`/api/sync/${type}`);
    return response.data;
  },

  // Get all disaster data (for map)
  getDisastersForMap: async () => {
    const response = await apiClient.get('/api/disasters', {
      params: { limit: 100 }
    });
    return response.data.data;
  },
};

