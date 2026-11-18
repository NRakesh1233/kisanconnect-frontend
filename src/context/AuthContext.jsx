import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import customerService from '../services/customerService';
import farmerService from '../services/farmerService';
import { ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('Authorization') || localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => {
    const stored = localStorage.getItem('role');
    return stored ? stored.toUpperCase() : null;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details based on role
  const fetchCurrentUser = useCallback(async (currentRole, currentToken) => {
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (currentRole === ROLES.FARMER) {
        const farmerProfile = await farmerService.loadUserProfile();
        if (farmerProfile) {
          setUser({
            ...farmerProfile,
            id: farmerProfile.id || farmerProfile.farmerId,
            name: farmerProfile.name || farmerProfile.farmerName,
            role: ROLES.FARMER,
          });
        }
      } else if (currentRole === ROLES.CUSTOMER) {
        const custProfile = await customerService.getProfile();
        if (custProfile) {
          setUser({
            ...custProfile,
            id: custProfile.id || custProfile.customerId,
            name: custProfile.firstName ? `${custProfile.firstName} ${custProfile.lastName || ''}`.trim() : custProfile.name,
            role: ROLES.CUSTOMER,
          });
        }
      }
    } catch (err) {
      console.warn('Could not load active user profile session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser(role, token);
    } else {
      setLoading(false);
    }
  }, [token, role, fetchCurrentUser]);

  // Standard Email/Password Login
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    authService.storeSession(data);

    const userRole = String(data.role).toUpperCase();
    setToken(data.token);
    setRole(userRole);

    await fetchCurrentUser(userRole, data.token);
    return data;
  };

  // Google OAuth SSO Login
  const googleLogin = async (credential) => {
    const data = await authService.googleLogin(credential);
    authService.storeSession(data);

    const userRole = String(data.role).toUpperCase();
    setToken(data.token);
    setRole(userRole);

    await fetchCurrentUser(userRole, data.token);
    return data;
  };

  // User Registration
  const register = async (userData) => {
    return await authService.register(userData);
  };

  // Logout
  const logout = () => {
    authService.clearSession();
    setToken(null);
    setRole(null);
    setUser(null);
  };

  // Update in-memory user profile
  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : updatedData));
  };

  const isFarmer = role === ROLES.FARMER;
  const isCustomer = role === ROLES.CUSTOMER;
  const isAuthenticated = Boolean(token);

  const value = {
    token,
    role,
    user,
    loading,
    isAuthenticated,
    isFarmer,
    isCustomer,
    login,
    googleLogin,
    register,
    logout,
    updateUser,
    refreshUser: () => fetchCurrentUser(role, token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
