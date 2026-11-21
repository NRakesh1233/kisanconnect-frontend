import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import confetti from 'canvas-confetti';
import authService from '../../services/authService';
import { ROLES } from '../../utils/constants';

export const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'MALE',
      dateOfBirth: new Date().toISOString().split('T')[0],
      mobileNumber: '',
      role: 'CUSTOMER', // Default choice
      village: '',
      district: '',
      state: '',
      pincode: '',
      terms: false,
    },
    validationSchema: yup.object({
      role: yup
        .string()
        .oneOf([ROLES.CUSTOMER, ROLES.FARMER], 'Please select Customer or Farmer role')
        .required('Please select an account type'),
      name: yup.string().trim().required('Full name is required'),
      email: yup.string().email('Please enter a valid email address').required('Email is required'),
      mobileNumber: yup
        .string()
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
        .required('Mobile number is required'),
      gender: yup.string().required('Please select gender'),
      dateOfBirth: yup.string().required('Date of birth is required'),
      village: yup.string().trim().required('Village / City is required'),
      district: yup.string().trim().required('District is required'),
      state: yup.string().trim().required('State is required'),
      pincode: yup
        .string()
        .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
        .required('Pincode is required'),
      password: yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
          'Must include uppercase, lowercase, number & special character'
        )
        .required('Password is required'),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      terms: yup.bool().oneOf([true], 'You must accept the Terms & Conditions'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMessage('');

      // Destructure out client-only fields before sending backend payload
      const { confirmPassword, terms, ...payload } = values;

      try {
        await authService.register(payload);
        setIsSuccess(true);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // Graceful fallback if canvas is not supported
        }

        setTimeout(() => {
          navigate('/login');
        }, 2200);
      } catch (err) {
        setIsLoading(false);
        const backendMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Registration failed. Please review your details and try again.';
        setErrorMessage(backendMsg);
      }
    },
  });

  return (
    <div className="kc-card p-4 p-sm-5 shadow-lg border-0 my-3" style={{ borderRadius: 'var(--kc-radius-xl)' }}>
      {/* Success Notification Banner */}
      {isSuccess && (
        <div
          className="alert alert-success border-0 text-center p-4 rounded-4 mb-4 shadow-sm"
          style={{ backgroundColor: 'var(--kc-fresh-green-light)', color: 'var(--kc-forest-green)' }}
        >
          <div className="rounded-circle d-inline-flex p-3 bg-white text-success shadow-sm mb-2">
            <i className="bi bi-check-circle-fill display-6"></i>
          </div>
          <h4 className="fw-bold mb-1">Registration Successful!</h4>
          <p className="small mb-0 opacity-75">
            Your KisanConnect account is created. Redirecting to login...
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <span className="badge kc-badge-organic text-dark mb-2">Create Account</span>
        <h2 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.85rem' }}>
          Join KisanConnect
        </h2>
        <p className="text-muted small mb-0">
          Connect directly with verified organic growers or supply farm produce.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          className="alert alert-danger border-0 d-flex align-items-center gap-2 small py-2.5 px-3 rounded-3 mb-4"
          role="alert"
          style={{ backgroundColor: 'var(--kc-crimson-red-subtle)', color: 'var(--kc-crimson-red)' }}
        >
          <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        {/* ========================================================
            1. ROLE SELECTION (CUSTOMER vs FARMER ONLY)
            ======================================================== */}
        <div className="mb-4">
          <label className="kc-label small text-uppercase" style={{ letterSpacing: '0.05em' }}>
            Choose Your Account Type
          </label>
          <div className="row g-3">
            {/* Customer Option */}
            <div className="col-6">
              <div
                className={`p-3 rounded-3 border text-center transition-all cursor-pointer h-100 d-flex flex-column align-items-center justify-content-center ${
                  formik.values.role === ROLES.CUSTOMER
                    ? 'border-success bg-white shadow-sm'
                    : 'border-secondary border-opacity-25 bg-light'
                }`}
                onClick={() => formik.setFieldValue('role', ROLES.CUSTOMER)}
                style={{
                  cursor: 'pointer',
                  borderWidth: formik.values.role === ROLES.CUSTOMER ? '2px' : '1px',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor:
                      formik.values.role === ROLES.CUSTOMER
                        ? 'var(--kc-fresh-green-light)'
                        : 'rgba(0,0,0,0.05)',
                    color:
                      formik.values.role === ROLES.CUSTOMER
                        ? 'var(--kc-fresh-green)'
                        : 'var(--kc-text-muted)',
                  }}
                >
                  <i className="bi bi-bag-heart fs-5"></i>
                </div>
                <strong
                  className={`small d-block ${
                    formik.values.role === ROLES.CUSTOMER ? 'text-success' : 'text-dark'
                  }`}
                >
                  Customer
                </strong>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Buy fresh farm produce
                </span>
              </div>
            </div>

            {/* Farmer Option */}
            <div className="col-6">
              <div
                className={`p-3 rounded-3 border text-center transition-all cursor-pointer h-100 d-flex flex-column align-items-center justify-content-center ${
                  formik.values.role === ROLES.FARMER
                    ? 'border-success bg-white shadow-sm'
                    : 'border-secondary border-opacity-25 bg-light'
                }`}
                onClick={() => formik.setFieldValue('role', ROLES.FARMER)}
                style={{
                  cursor: 'pointer',
                  borderWidth: formik.values.role === ROLES.FARMER ? '2px' : '1px',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor:
                      formik.values.role === ROLES.FARMER
                        ? 'var(--kc-fresh-green-light)'
                        : 'rgba(0,0,0,0.05)',
                    color:
                      formik.values.role === ROLES.FARMER
                        ? 'var(--kc-fresh-green)'
                        : 'var(--kc-text-muted)',
                  }}
                >
                  <i className="bi bi-flower2 fs-5"></i>
                </div>
                <strong
                  className={`small d-block ${
                    formik.values.role === ROLES.FARMER ? 'text-success' : 'text-dark'
                  }`}
                >
                  Farmer
                </strong>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Sell organic harvest
                </span>
              </div>
            </div>
          </div>
          {formik.touched.role && formik.errors.role && (
            <div className="kc-error-message">{formik.errors.role}</div>
          )}
        </div>

        {/* ========================================================
            2. PERSONAL INFORMATION
            ======================================================== */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="kc-badge kc-badge-cream">1</span>
            <span className="fw-bold small text-dark">Personal Information</span>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="kc-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Ramesh Patel"
                className={`kc-input ${formik.touched.name && formik.errors.name ? 'kc-input-error' : ''}`}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="kc-error-message">{formik.errors.name}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="kc-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. user@gmail.com"
                className={`kc-input ${formik.touched.email && formik.errors.email ? 'kc-input-error' : ''}`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="kc-error-message">{formik.errors.email}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="kc-label" htmlFor="mobileNumber">
                Mobile Number
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                className={`kc-input ${formik.touched.mobileNumber && formik.errors.mobileNumber ? 'kc-input-error' : ''}`}
                value={formik.values.mobileNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                <div className="kc-error-message">{formik.errors.mobileNumber}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="kc-label" htmlFor="dateOfBirth">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                className={`kc-input ${formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'kc-input-error' : ''}`}
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <div className="kc-error-message">{formik.errors.dateOfBirth}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="kc-label" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="kc-select"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. LOCATION DETAILS
            ======================================================== */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="kc-badge kc-badge-cream">2</span>
            <span className="fw-bold small text-dark">Location Details</span>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="kc-label" htmlFor="village">
                Village / City
              </label>
              <input
                id="village"
                name="village"
                type="text"
                placeholder="Village or City name"
                className={`kc-input ${formik.touched.village && formik.errors.village ? 'kc-input-error' : ''}`}
                value={formik.values.village}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.village && formik.errors.village && (
                <div className="kc-error-message">{formik.errors.village}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="kc-label" htmlFor="district">
                District
              </label>
              <input
                id="district"
                name="district"
                type="text"
                placeholder="District"
                className={`kc-input ${formik.touched.district && formik.errors.district ? 'kc-input-error' : ''}`}
                value={formik.values.district}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.district && formik.errors.district && (
                <div className="kc-error-message">{formik.errors.district}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="kc-label" htmlFor="state">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                placeholder="State"
                className={`kc-input ${formik.touched.state && formik.errors.state ? 'kc-input-error' : ''}`}
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.state && formik.errors.state && (
                <div className="kc-error-message">{formik.errors.state}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="kc-label" htmlFor="pincode">
                Pincode
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                maxLength={6}
                placeholder="6-digit Pincode"
                className={`kc-input ${formik.touched.pincode && formik.errors.pincode ? 'kc-input-error' : ''}`}
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.pincode && formik.errors.pincode && (
                <div className="kc-error-message">{formik.errors.pincode}</div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            4. SECURITY & CREDENTIALS
            ======================================================== */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="kc-badge kc-badge-cream">3</span>
            <span className="fw-bold small text-dark">Account Security</span>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="kc-label" htmlFor="password">
                Password
              </label>
              <div className="position-relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`kc-input ${formik.touched.password && formik.errors.password ? 'kc-input-error' : ''}`}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="kc-error-message">{formik.errors.password}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="kc-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="position-relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  className={`kc-input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'kc-input-error' : ''}`}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="kc-error-message">{formik.errors.confirmPassword}</div>
              )}
            </div>

            <div className="col-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showPasswordCheck"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label className="form-check-label small text-muted" htmlFor="showPasswordCheck">
                  Show passwords
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. TERMS & CONDITIONS
            ======================================================== */}
        <div className="mb-4">
          <div className="form-check">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              className={`form-check-input ${formik.touched.terms && formik.errors.terms ? 'is-invalid' : ''}`}
              checked={formik.values.terms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <label htmlFor="terms" className="form-check-label small text-muted">
              I agree to the KisanConnect{' '}
              <a href="#terms" className="text-success text-decoration-underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-success text-decoration-underline">
                Privacy Policy
              </a>.
            </label>
          </div>
          {formik.touched.terms && formik.errors.terms && (
            <div className="kc-error-message">{formik.errors.terms}</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="kc-btn kc-btn-primary kc-btn-lg w-100 justify-content-center shadow-sm"
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              <span>Creating Your Account...</span>
            </>
          ) : (
            <>
              <span>Complete Registration</span>
              <i className="bi bi-arrow-right"></i>
            </>
          )}
        </button>

        {/* Link to Login */}
        <div className="text-center mt-4 pt-2 border-top">
          <p className="small text-muted mb-0">
            Already have an account?{' '}
            <Link to="/login" className="fw-bold text-success text-decoration-none">
              Sign In here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
