
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import authService from '../services/authService';
import customerService from '../services/customerService';
import farmerService from '../services/farmerService';
import { ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  // Restore existing authentication session
  const [token, setToken] = useState(
    () =>
      localStorage.getItem('Authorization') ||
      localStorage.getItem('token') ||
      null
  );

  const [role, setRole] = useState(() => {
    const stored = localStorage.getItem('role');
    return stored ? stored.toUpperCase() : null;
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent outdated API responses from overwriting newer state
  const requestIdRef = useRef(0);

  // Fetch current user profile
  const fetchCurrentUser = useCallback(
    async (currentRole, currentToken) => {

      const requestId = ++requestIdRef.current;

      if (!currentToken || !currentRole) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let profile = null;

        const normalizedRole = String(currentRole).toUpperCase();

        // Farmer profile
        if (normalizedRole === ROLES.FARMER) {

          const farmerProfile =
            await farmerService.loadUserProfile();

          if (farmerProfile) {
            profile = {
              ...farmerProfile,
              id:
                farmerProfile.id ||
                farmerProfile.farmerId,
              name:
                farmerProfile.name ||
                farmerProfile.farmerName,
              role: ROLES.FARMER,
            };
          }

        }

        // Customer profile
        else if (normalizedRole === ROLES.CUSTOMER) {

          const custProfile =
            await customerService.getProfile();

          if (custProfile) {
            profile = {
              ...custProfile,
              id:
                custProfile.id ||
                custProfile.customerId,
              name: custProfile.firstName
                ? `${custProfile.firstName} ${
                    custProfile.lastName || ''
                  }`.trim()
                : custProfile.name,
              role: ROLES.CUSTOMER,
            };
          }

        }

        // Update only if this is the latest request
        if (requestId === requestIdRef.current) {
          setUser(profile);
        }

      } catch (err) {

        console.error(
          'Could not load active user profile:',
          err
        );

        if (requestId === requestIdRef.current) {
          setUser(null);
        }

      } finally {

        if (requestId === requestIdRef.current) {
          setLoading(false);
        }

      }
    },
    []
  );

  // Restore profile when application starts
  // Also runs when authentication token or role changes
  useEffect(() => {

    fetchCurrentUser(role, token);

    return () => {
      // Invalidate previous requests
      requestIdRef.current += 1;
    };

  }, [token, role, fetchCurrentUser]);

  // Email and password login
  const login = async (credentials) => {

    const data = await authService.login(credentials);

    authService.storeSession(data);

    const userRole = String(data.role).toUpperCase();

    setLoading(true);
    setToken(data.token);
    setRole(userRole);

    // Profile fetching is handled ONLY by useEffect
    return data;
  };

  // Google OAuth login
  const googleLogin = async (credential) => {

    const data = await authService.googleLogin(credential);

    authService.storeSession(data);

    const userRole = String(data.role).toUpperCase();

    setLoading(true);
    setToken(data.token);
    setRole(userRole);

    // Profile fetching is handled ONLY by useEffect
    return data;
  };

  // User registration
  const register = async (userData) => {
    return await authService.register(userData);
  };

  // Logout
  const logout = () => {

    // Invalidate any pending profile request
    requestIdRef.current += 1;

    authService.clearSession();

    setToken(null);
    setRole(null);
    setUser(null);
    setLoading(false);
  };

  // Update user profile in memory
  const updateUser = (updatedData) => {

    setUser((prev) =>
      prev
        ? { ...prev, ...updatedData }
        : updatedData
    );

  };

  // Manually refresh user profile
  const refreshUser = useCallback(() => {
    return fetchCurrentUser(role, token);
  }, [fetchCurrentUser, role, token]);

  // Role checks
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
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

};

// Custom authentication hook
export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export default AuthContext;
