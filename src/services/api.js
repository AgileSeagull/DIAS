import axios from "axios";

// Dynamic API Base URL configuration
const getApiBaseUrl = () => {
	// Priority 1: Check runtime config (loaded from config.js)
	if (window.__RUNTIME_CONFIG__?.API_BASE_URL) {
		return window.__RUNTIME_CONFIG__.API_BASE_URL;
	}

	// Priority 2: Check build-time environment variable
	if (import.meta.env.VITE_API_BASE_URL) {
		return import.meta.env.VITE_API_BASE_URL;
	}

	// Priority 3: Auto-detect based on current host
	const hostname = window.location.hostname;
	const protocol = window.location.protocol;

	// If running on localhost, use localhost backend
	if (hostname === "localhost" || hostname === "127.0.0.1") {
		return "http://localhost:5000";
	}

	// If running on EC2 or any other host, use the same host with port 5000
	return `${protocol}//${hostname}:5000`;
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
console.log("API Base URL:", API_BASE_URL);
console.log("Current Host:", window.location.hostname);

// Create axios instance with default config
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
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
		console.error("API Error:", error);
		return Promise.reject(error);
	}
);

export default apiClient;

// API service functions
export const disasterAPI = {
	// Get all disasters
	getAllDisasters: async (filters = {}) => {
		const response = await apiClient.get("/api/disasters", {
			params: filters,
		});
		return response.data.data;
	},

	// Get single disaster
	getDisasterById: async (id) => {
		const response = await apiClient.get(`/api/disasters/${id}`);
		return response.data.data;
	},

	// Get nearby disasters
	getNearbyDisasters: async (lat, lng, radiusKm = 100) => {
		const response = await apiClient.get("/api/disasters/nearby", {
			params: { lat, lng, radius_km: radiusKm },
		});
		return response.data.data;
	},

	// Get disaster statistics
	getStats: async () => {
		const response = await apiClient.get("/api/disasters/stats");
		return response.data.data;
	},

	// Sync data
	syncDisasters: async (type = "all") => {
		const response = await apiClient.post(`/api/sync/${type}`);
		return response.data;
	},

	// Get all disaster data (for map)
	getDisastersForMap: async () => {
		const response = await apiClient.get("/api/disasters", {
			params: { limit: 100 },
		});
		return response.data.data;
	},
};
