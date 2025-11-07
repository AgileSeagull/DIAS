// Runtime configuration
// This file is loaded before the main app and provides runtime environment configuration
window.__RUNTIME_CONFIG__ = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : `${window.location.protocol}//${window.location.hostname}:5000`
};
