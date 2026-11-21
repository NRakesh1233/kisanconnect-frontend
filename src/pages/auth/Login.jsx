
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { GoogleLogin } from '@react-oauth/google';

import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, googleLogin } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect path after successful login
  const from = location.state?.from?.pathname;

  // Role-based navigation
  const handleRoleRedirect = (role) => {
    const userRole = String(role || '').toUpperCase();

    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (userRole === ROLES.FARMER) {
      navigate('/dashboard', { replace: true });
    } else if (userRole === ROLES.CUSTOMER) {
      navigate('/customer/home', { replace: true });
    } else {
      setErrorMessage('Invalid user role. Please contact support.');
    }
  };

  // Email and password validation
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },

    validationSchema: yup.object({
      email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email address is required'),

      password: yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    }),

    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await login(values);

        // Profile fetching is handled by AuthContext
        handleRoleRedirect(data.role);

      } catch (err) {
        const backendMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid credentials. Please verify your email and password.';

        setErrorMessage(backendMsg);
        setIsLoading(false);
      }
    },
  });

  // Google OAuth success
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMessage(
        'Google authentication credential missing. Please try again.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await googleLogin(
        credentialResponse.credential
      );

      // Profile fetching is handled by AuthContext
      handleRoleRedirect(data.role);

    } catch (err) {
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Google login failed. Please try again.';

      setErrorMessage(backendMsg);
      setIsLoading(false);
    }
  };

  // Google OAuth error
  const handleGoogleError = () => {
    setIsLoading(false);
    setErrorMessage(
      'Google Sign-In failed or was cancelled.'
    );
  };

  return (
    <div
      className="kc-card p-4 p-sm-5 shadow-lg border-0"
      style={{
        borderRadius: 'var(--kc-radius-xl)',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <span className="badge kc-badge-organic text-dark mb-2">
          Welcome Back
        </span>

        <h2
          className="fw-extrabold text-dark mb-1"
          style={{ fontSize: '1.85rem' }}
        >
          Sign In to KisanConnect
        </h2>

        <p className="text-muted small mb-0">
          Access your farm harvest cockpit or marketplace
          order history.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          className="alert alert-danger border-0 d-flex align-items-center gap-2 small py-2 px-3 rounded-3 mb-4"
          role="alert"
          style={{
            backgroundColor: 'var(--kc-crimson-red-subtle)',
            color: 'var(--kc-crimson-red)',
          }}
        >
          <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google OAuth */}
      <div className="mb-4">
        <div className="w-100 d-flex justify-content-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            shape="pill"
            theme="outline"
            text="signin_with"
            size="large"
          />
        </div>

        <div className="position-relative text-center my-4">
          <hr className="my-0 border-secondary opacity-25" />

          <span
            className="position-absolute top-50 start-50 translate-middle px-3 text-muted small"
            style={{
              backgroundColor: 'var(--kc-white)',
              fontSize: '0.8rem',
            }}
          >
            or sign in with email
          </span>
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={formik.handleSubmit}>

        {/* Email */}
        <div className="kc-form-group">
          <label
            className="kc-label"
            htmlFor="email"
          >
            Email Address
          </label>

          <div className="position-relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. yourname@domain.com"
              className={`kc-input ${
                formik.touched.email && formik.errors.email
                  ? 'kc-input-error'
                  : ''
              }`}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          {formik.touched.email && formik.errors.email && (
            <div className="kc-error-message">
              {formik.errors.email}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="kc-form-group">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label
              className="kc-label mb-0"
              htmlFor="password"
            >
              Password
            </label>

            <span
              className="small text-muted"
              style={{ fontSize: '0.8rem' }}
            >
              Min. 8 characters
            </span>
          </div>

          <div className="position-relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`kc-input ${
                formik.touched.password &&
                formik.errors.password
                  ? 'kc-input-error'
                  : ''
              }`}
              style={{ paddingRight: '42px' }}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0 me-3 text-decoration-none"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              <i
                className={`bi ${
                  showPassword ? 'bi-eye-slash' : 'bi-eye'
                }`}
              ></i>
            </button>
          </div>

          {formik.touched.password &&
            formik.errors.password && (
              <div className="kc-error-message">
                {formik.errors.password}
              </div>
            )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formik.isValid}
          className="kc-btn kc-btn-primary kc-btn-lg w-100 justify-content-center mt-3 shadow-sm"
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>

              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Account</span>
              <i className="bi bi-arrow-right"></i>
            </>
          )}
        </button>

        {/* Register */}
        <div className="text-center mt-4 pt-2 border-top">
          <p className="small text-muted mb-0">
            Don't have an account yet?{' '}

            <Link
              to="/register"
              className="fw-bold text-success text-decoration-none"
            >
              Register as Customer or Farmer
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
};

export default Login;
