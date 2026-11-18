import api from './api';

export const customerService = {
  // ==========================================
  // Address Management
  // ==========================================
  /**
   * Fetch all saved addresses for the logged-in customer
   * @returns {Promise<Array>}
   */
  getAddresses: async () => {
    const response = await api.get('/customer/address/all');
    return response.data;
  },

  /**
   * Add a new delivery address
   * @param {Object} addressData
   * @returns {Promise<any>}
   */
  addAddress: async (addressData) => {
    const response = await api.post('/customer/address/add', addressData);
    return response.data;
  },

  /**
   * Delete an existing address by ID
   * @param {string|number} addressId
   * @returns {Promise<any>}
   */
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/customer/address/delete/${addressId}`);
    return response.data;
  },

  // ==========================================
  // Profile Management
  // ==========================================
  /**
   * Fetch customer profile details
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    const response = await api.get('/customer/profile');
    return response.data;
  },

  getCustomerProfile: async () => {
    return customerService.getProfile();
  },

  /**
   * Update customer profile photo
   * @param {FormData} formData
   * @returns {Promise<any>}
   */
  updateProfilePhoto: async (formData) => {
    const response = await api.post('/customer/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ==========================================
  // Cart Management
  // ==========================================
  /**
   * Fetch items in customer's cart
   * @returns {Promise<Array>}
   */
  getCartProducts: async () => {
    const response = await api.get('customer/cart/products');
    return response.data;
  },

  /**
   * Add product to cart
   * @param {Object} cartPayload - { productId, cartPrice, quantity, totalPrice }
   * @returns {Promise<any>}
   */
  addToCart: async (cartPayload) => {
    const response = await api.post('customer/cart/add', cartPayload);
    return response.data;
  },

  /**
   * Update product quantity in cart
   * @param {string|number} cartId
   * @param {Object} payload - { productId, cartPrice, quantity, totalPrice }
   * @returns {Promise<any>}
   */
  updateCartQuantity: async (cartId, payload) => {
    const response = await api.put(`customer/cart/update/quantity/${cartId}`, payload);
    return response.data;
  },

  /**
   * Remove single item from cart
   * @param {string|number} cartId
   * @returns {Promise<any>}
   */
  removeFromCart: async (cartId) => {
    const response = await api.delete(`customer/cart/delete/${cartId}`);
    return response.data;
  },

  /**
   * Clear entire cart
   * @returns {Promise<any>}
   */
  clearCart: async () => {
    const response = await api.delete('customer/cart/delete/all');
    return response.data;
  },

  // ==========================================
  // Order Management
  // ==========================================
  /**
   * Place an order (COD or Online)
   * @param {Object} orderPayload - { addressId, farmerId, paymentMethod, transactionId, orderItems }
   * @returns {Promise<Object>}
   */
  placeOrder: async (orderPayload) => {
    const response = await api.post('customer/order/add', orderPayload);
    return response.data;
  },

  /**
   * Fetch all orders placed by the customer
   * @returns {Promise<Array>}
   */
  getCustomerOrders: async () => {
    const response = await api.get('customer/orders/all');
    return response.data;
  },

  /**
   * Fetch specific order details by ID
   * @param {string|number} orderId
   * @returns {Promise<Object>}
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`customer/orders/${orderId}`);
    return response.data;
  },

  // ==========================================
  // Customer Product Reviews
  // ==========================================
  /**
   * Fetch all reviews submitted by the customer
   * @returns {Promise<Array>}
   */
  getCustomerReviews: async () => {
    const response = await api.get('customer/reviews/all');
    return response.data;
  },

  /**
   * Fetch review for specific order item
   * @param {string|number} orderItemId
   * @returns {Promise<Object>}
   */
  getOrderItemReview: async (orderItemId) => {
    const response = await api.get(`/customer/reviews/orderItem/${orderItemId}`);
    return response.data;
  },

  /**
   * Submit new review for an order item
   * @param {Object} payload - { OrderItemId, rating, review }
   * @returns {Promise<any>}
   */
  addProductReview: async (payload) => {
    const response = await api.post('/customer/order/product/review/add', payload);
    return response.data;
  },

  /**
   * Update existing review for an order item
   * @param {Object} payload - { OrderItemId, rating, review }
   * @returns {Promise<any>}
   */
  updateProductReview: async (payload) => {
    const response = await api.put('/customer/order/product/review/update', payload);
    return response.data;
  },
};

export default customerService;
