import api from './api';

export const farmerService = {
  // Fetch specific farmer profile details by ID
  getFarmerById: async (farmerId) => {
    const response = await api.get(`/public/user/farmers/${farmerId}`);
    return response.data;
  },
  getAllFarmers: async () => {
    // Adjust endpoint based on your Spring Boot controller mapping (e.g. /public/farmers or /farmers)
    const response = await api.get('/public/user/farmers/all');
    return response.data;
  },

  // Fetch all products uploaded by a specific farmer
  getProductsByFarmer: async (farmerId) => {
    const response = await api.get(`public/products/farmer/${farmerId}`);
    return response.data;
  }
};