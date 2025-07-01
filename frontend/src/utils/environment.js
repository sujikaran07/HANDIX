// Environment configuration for different deployment environments

// API configuration - update for production deployment
export const API_BASE_URL = 'http://localhost:5000';

// Application metadata
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'HANDIX';

// Get environment configuration values by key
export const getEnvConfig = (key) => {
  const config = {
    apiBaseUrl: API_BASE_URL,
    appVersion: APP_VERSION,
    appName: APP_NAME,
  };
  
  return config[key] || null;
};
