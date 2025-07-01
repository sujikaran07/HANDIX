import axios from 'axios';

// Set API base URL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Axios instance with base config
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach auth token to requests if available
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

const orderService = {
  // Fetch all orders for the current customer
  getCustomerOrders: async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = userData.c_id;
      if (!customerId) throw new Error('Customer ID not found');
      const response = await api.get(`/api/orders/customer?customerId=${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },

  // Fetch a specific order by its ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },
  
  // Fetch product image URL by product ID
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

  // Fetch inventory item by product ID (with auth)
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
