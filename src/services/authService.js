import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const authService = {
  /**
   * User login with Email & Password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { token, refreshToken, role }
   */
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/public/user/login`, credentials, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  /**
   * Google OAuth SSO Login
   * @param {string} credential - Google OAuth credential JWT
   * @returns {Promise<Object>} - { token, refreshToken, role }
   */
  googleLogin: async (credential) => {
    const response = await axios.post(
      `${API_BASE_URL}/public/auth/google`,
      { credential },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  /**
   * Register new user (Customer or Farmer)
   * @param {Object} userData - { name, email, password, gender, dateOfBirth, mobileNumber, role, village, district, state, pincode }
   * @returns {Promise<any>}
   */
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/public/user/register`, userData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  /**
   * Refresh JWT Token
   * @param {string} refreshToken
   * @returns {Promise<Object>} - { token, refreshToken }
   */
  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_BASE_URL}/public/user/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Save session tokens and role to localStorage
   * @param {Object} authData - { token, refreshToken, role }
   */
  storeSession: (authData) => {
    if (authData.token) {
      localStorage.setItem('Authorization', authData.token);
      localStorage.setItem('token', authData.token);
    }
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }
    if (authData.role) {
      localStorage.setItem('role', authData.role);
    }
  },

  /**
   * Clear session tokens from localStorage
   */
  clearSession: () => {
    localStorage.removeItem('Authorization');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return Boolean(localStorage.getItem('Authorization') || localStorage.getItem('token'));
  },

  /**
   * Get current stored role
   * @returns {string}
   */
  getStoredRole: () => {
    return (localStorage.getItem('role') || '').toUpperCase();
  },
};

export default authService;
