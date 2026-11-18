import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

/**
 * ProtectedRoute Guard
 * Restricts route access to authenticated users and specific roles (CUSTOMER or FARMER).
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Array<string>} [props.allowedRoles] - e.g. [ROLES.CUSTOMER] or [ROLES.FARMER]
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'var(--kc-cream)' }}>
        <div className="text-center p-4">
          <div className="spinner-border text-success mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading session...</span>
          </div>
          <p className="fw-semibold text-muted mb-0">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific role required, verify role matches
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If a Farmer tries to access Customer pages, send them to Farmer Dashboard
    if (role === ROLES.FARMER) {
      return <Navigate to="/dashboard" replace />;
    }
    // If a Customer tries to access Farmer pages, send them to Customer Home
    if (role === ROLES.CUSTOMER) {
      return <Navigate to="/customer/home" replace />;
    }
    // Fallback
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
