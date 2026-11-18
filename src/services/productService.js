import api from './api';

export const productService = {
  /**
   * Fetch all products
   * @returns {Promise<Array>}
   */
  getAllProducts: async () => {
    const response = await api.get('/public/products');
    return response.data;
  },

  /**
   * Fetch top 4 featured products for landing pages
   * @returns {Promise<Array>}
   */
  getTop4Products: async () => {
    const response = await api.get('/public/products/top4');
    return response.data;
  },

  /**
   * Fetch single product details by ID
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  getProductById: async (id) => {
    const response = await api.get(`/public/products/${id}`);
    return response.data;
  },

  /**
   * Fetch products uploaded by a specific Farmer ID
   * @param {string|number} farmerId
   * @returns {Promise<Array>}
   */
  getProductsByFarmer: async (farmerId) => {
    const response = await api.get(`/public/products/farmer/${farmerId}`);
    return response.data;
  },

  /**
   * Fetch public customer reviews for a specific product
   * @param {string|number} productId
   * @returns {Promise<Array>}
   */
  getProductReviews: async (productId) => {
    const response = await api.get(`/public/reviews/product/${productId}`);
    return response.data;
  },
};

export default productService;
