import api from './api';

export const productService = {
  // Fetch all products
  getAllProducts: async () => {
    const response = await api.get('/public/products');
    return response.data;
  },

  //Fetch product by  categories
//  getCategories: async (cat) => {
//     const response = await api.get(`/public/category/${cat}`);
// return response.data;
//   },

  // Fetch single product details by ID
  getProductById: async (id) => {
    const response = await api.get(`/public/products/${id}`);
    return response.data;
  },

  // Fetch products by specific Farmer ID
  getProductsByFarmer: async (farmerId) => {
    const response = await api.get(`/public/products/farmer/${farmerId}`);
    console.log('Fetched products by farmerId:', farmerId, response.data);
    return response.data;
  }
};