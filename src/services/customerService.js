import api from './api';

export const customerService = {
  // Address Management Endpoints
  getAddresses: async () => {
    const response = await api.get('/customer/address/all');
    return response.data;
  },
getProfile: async ()=>{
  const response= await api.get('/customer/profile');
  return response.data;
},
  addAddress: async (addressData) => {
    const response = await api.post('/customer/address/add', addressData);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/customer/address/delete/${addressId}`);
    return response.data;
  },

  // Order Management Endpoints
  placeOrder: async (orderPayload) => {
    const response = await api.post('customer/order/add', orderPayload);
    return response.data;
  },

  getCustomerOrders: async () => {
    const response = await api.get('customer/orders/all');
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`customer/orders/${orderId}`);
    return response.data;
  },

  getCustomerReviews: async () => {
    const response = await api.get(`customer/reviews/all`);
    return response.data;
  }




};