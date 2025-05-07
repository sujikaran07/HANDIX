import axios from 'axios';

// Get base URL from environment variables or use default
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to inject auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Service methods for orders
const orderService = {
  /**
   * Get all orders for the logged-in customer
   */
  getCustomerOrders: async () => {
    try {
      // Get customer ID from local storage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = userData.c_id;
      
      if (!customerId) {
        throw new Error('Customer ID not found');
      }
      
      console.log(`Fetching orders for customer: ${customerId}`);
      
      // Make API request with customer ID as query parameter
      const response = await api.get(`/api/orders/customer?customerId=${customerId}`);
      
      // Return processed data
      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },

  /**
   * Get a specific order by ID
   */
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get product image by product ID
   */
  getProductImage: async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}`);
      if (response.data && response.data.image_url) {
        return response.data.image_url;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching product image for ${productId}:`, error);
      return null;
    }
  },

  /**
   * Get inventory item by product ID
   */
  getInventoryItem: async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};
      
      const response = await axios.get(
        `${baseURL}/api/inventory/product/${productId}`,
        config
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory item for product ${productId}:`, error);
      return null;
    }
  },

  /**
   * Get inventory item details by product ID
   */
  getInventoryItemDetails: async (productId) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${baseURL}/api/inventory/product/${productId}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return null;
    }
  }
};

export default orderService;
