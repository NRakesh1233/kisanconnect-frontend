import api from './api';

export const farmerService = {
  // ==========================================
  // Public Farmer Directory & Storefront
  // ==========================================
  /**
   * Fetch all registered public farmers
   * @returns {Promise<Array>}
   */
  getAllFarmers: async () => {
    const response = await api.get('/public/user/farmers/all');
    return response.data;
  },

  /**
   * Fetch specific farmer profile details by ID
   * @param {string|number} farmerId
   * @returns {Promise<Object>}
   */
  getFarmerById: async (farmerId) => {
    const response = await api.get(`/public/user/farmers/${farmerId}`);
    return response.data;
  },

  /**
   * Fetch all products uploaded by a specific farmer
   * @param {string|number} farmerId
   * @returns {Promise<Array>}
   */
  getProductsByFarmer: async (farmerId) => {
    const response = await api.get(`public/products/farmer/${farmerId}`);
    return response.data;
  },

  // ==========================================
  // Farmer Portal & Dashboard (Protected)
  // ==========================================
  /**
   * Load farmer dashboard metrics and recent orders
   * @returns {Promise<Array>} [stats, farmer]
   */
  loadDashboard: async () => {
    try {
      const res = await api.get('/farmer/dashboard');
      const stats = res.data;
      const farmer = {
        name: res.data?.farmerName || 'Farmer',
        profilePic: res.data?.profilePic || '',
        quote: 'Fresh food starts with passionate farmers.',
      };
      return [stats, farmer];
    } catch (error) {
      console.warn('Dashboard fetch fallback applied:', error);
      const stats = {
        products: 142,
        orders: 24,
        revenue: 12450,
        rating: 4.9,
      };
      const farmer = {
        name: 'Rakesh',
        profilePic: 'https://i.pravatar.cc/200?img=12',
        quote: 'Healthy farms create healthy lives.',
      };
      return [stats, farmer];
    }
  },

  /**
   * Fetch logged-in farmer profile details
   * @returns {Promise<Object>}
   */
  loadUserProfile: async () => {
    try {
      const res = await api.get('/farmer/details');
      return res.data;
    } catch (error) {
      console.error('Error fetching farmer profile:', error);
      return null;
    }
  },

  /**
   * Update farmer profile photo
   * @param {FormData} formData
   * @returns {Promise<any>}
   */
  updateFarmerProfile: async (formData) => {
    const res = await api.post('/farmer/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Fetch reviews on farmer's products
   * @returns {Promise<Array>}
   */
  loadReviews: async () => {
    try {
      const res = await api.get('/farmer/products/reviews');
      return res.data || [];
    } catch (error) {
      console.error('Error fetching farmer reviews:', error);
      return [];
    }
  },

  /**
   * Fetch farmer earnings breakdown
   * @param {string|number} pnum
   * @returns {Promise<any>}
   */
  loadFarmerEarnings: async (pnum) => {
    try {
      const res = await api.get(`/farmer/earnings/${pnum}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching farmer earnings:', error);
      return null;
    }
  },

  // ==========================================
  // Farmer Product Inventory Management
  // ==========================================
  /**
   * Add a new product (Multipart upload)
   * @param {FormData} formData
   * @returns {Promise<any>}
   */
  addProduct: async (formData) => {
    const response = await api.post('/farmer/products/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update an existing product (Multipart upload)
   * @param {string|number} pid
   * @param {FormData} formData
   * @returns {Promise<any>}
   */
  updateProduct: async (pid, formData) => {
    const response = await api.put(`/farmer/products/update/${pid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ==========================================
  // Farmer Order Fulfillment Management
  // ==========================================
  /**
   * Fetch all orders received by this farmer
   * @returns {Promise<Array>}
   */
  getFarmerOrders: async () => {
    const response = await api.get('/farmer/Orders/all');
    return response.data || [];
  },

  /**
   * Fetch orders filtered by status
   * @param {string} status e.g. 'PENDING', 'ACCEPTED', etc.
   * @returns {Promise<Array>}
   */
  getOrdersByStatus: async (status) => {
    const response = await api.get(`/farmer/Orders/bystatus/${status}`);
    return response.data || [];
  },

  /**
   * Update order status
   * @param {string|number} id
   * @param {string} status
   * @returns {Promise<any>}
   */
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/farmer/order/status?id=${id}&status=${status}`, {});
    return response.data;
  },
};

export default farmerService;
