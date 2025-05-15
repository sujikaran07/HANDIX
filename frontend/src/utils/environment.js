/**
 * Environment configuration for the application
 * Contains API base URLs and other environment-specific settings
 */

// API base URL - adjust based on environment
export const API_BASE_URL = 'http://localhost:5000';

// Other environment variables
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'HANDIX';

// Helper function to get environment-specific values
export const getEnvConfig = (key) => {
  const config = {
    apiBaseUrl: API_BASE_URL,
    appVersion: APP_VERSION,
    appName: APP_NAME,
  };
  
  return config[key] || null;
};
