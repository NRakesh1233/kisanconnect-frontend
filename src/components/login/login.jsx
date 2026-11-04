
import './login.css';
import '../navbar/common.css';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function Login() {
  const navigate = useNavigate();

  const [statusState, setStatusState] = useState({
    message: "",
    type: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  // Common function for storing tokens and redirecting users
  const handleLoginSuccess = (data) => {
    localStorage.setItem("Authorization", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", data.role);

    const userRole = String(data.role).toUpperCase();

    setStatusState({
      message: "Login successful! Redirecting...",
      type: "success"
    });

    if (userRole.includes("FARMER")) {
      navigate("/dashboard");
    } else if (userRole.includes("CUSTOMER")) {
      navigate("/customer/home");
    } else {
      setStatusState({
        message: `Unknown role: ${data.role}. Cannot redirect.`,
        type: "error"
      });
      setIsLoading(false);
    }
  };

  // Normal email/password login
  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },

    validationSchema: yup.object({
      email: yup.string()
        .email("Invalid email format!!")
        .required("Email is required!!"),

      password: yup.string()
        .min(8, "Password must be at least 8 characters!!")
        .required("Password is required!!")
    }),

    onSubmit: async (data) => {
      setIsLoading(true);
      setStatusState({ message: "", type: "" });

      try {
        const response = await axios.post(
          `${BASE_URL}/public/user/login`,
          data
        );

        handleLoginSuccess(response.data);

      } catch (error) {
        setIsLoading(false);

        const errorMsg =
          error.response?.data?.message ||
          "Login failed. Please check your credentials.";

        setStatusState({
          message: errorMsg,
          type: "error"
        });
      }
    }
  });

  // Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setStatusState({ message: "", type: "" });

      const response = await axios.post(
        `${BASE_URL}/public/auth/google`,
        {
          credential: credentialResponse.credential
        }
      );

      handleLoginSuccess(response.data);

    } catch (error) {
      console.error("Google login error:", error);

      setIsLoading(false);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Google login failed. Please try again.";

      setStatusState({
        message: errorMsg,
        type: "error"
      });
    }
  };

  const handleGoogleError = () => {
    setIsLoading(false);

    setStatusState({
      message: "Google authentication failed. Please try again.",
      type: "error"
    });
  };

  return (
    <div className='container-fluid login-page flexing'>

      <div className='login-img'>
        <div
          className="position-absolute z-10 glass-card flexing rounded-3 p-2 gap-2"
          style={{ bottom: "-60px", left: "40px" }}
        >
          <div
            className="rounded-circle badge1 bg-success flexing text-white mt-3"
            style={{ height: "50px", width: "50px" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
          </div>

          <div>
            <h3 className="font-headline-md text-headline-md text-success">
              Farm Fresh Legacy
            </h3>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Connecting roots to tables since 2024.
            </p>
          </div>
        </div>
      </div>

      <div className='login-container flexing flex-column gap-3'>

        <div className='login-logo fs-5 text-success fw-bold'>
          <span className="material-symbols-outlined text-success fs-3">
            eco
          </span>
          KisanConnect
        </div>

        <h1 className='fw-bold'>Welcome Back</h1>

        <div className='text-success'>
          Login to continue shopping fresh farm products.
        </div>

        <form
          className={`login-card shadow-lg flexing flex-column justify-content-evenly ${
            statusState.type === 'error' ? 'shake-animation' : ''
          }`}
          id='login-card'
          onSubmit={formik.handleSubmit}
        >

          {/* Status Notification */}
          {statusState.message && (
            <div
              className={`status-banner ${
                statusState.type === 'success'
                  ? 'status-success'
                  : 'status-error'
              }`}
            >
              <span className="material-symbols-outlined">
                {statusState.type === 'success'
                  ? 'check_circle'
                  : 'error'}
              </span>

              <span>{statusState.message}</span>
            </div>
          )}

          {/* Email Field */}
          <div className='field-container flexing flex-column my-4'>

            <div
              className={`login-field text-center flexing ${
                formik.touched.email && formik.errors.email
                  ? 'field-error'
                  : ''
              }`}
            >
              <span className="material-symbols-outlined fs-4">
                mail
              </span>

              <input
                type="email"
                name='email'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />

              <p className='position-absolute'>Email Address</p>
            </div>

            <span className='text-danger small-error'>
              {formik.touched.email && formik.errors.email}
            </span>
          </div>

          {/* Password Field */}
          <div className='field-container flexing flex-column'>

            <div
              className={`login-field text-center flexing ${
                formik.touched.password && formik.errors.password
                  ? 'field-error'
                  : ''
              }`}
            >
              <span className="material-symbols-outlined">
                lock
              </span>

              <input
                type="password"
                name='password'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />

              <p className='position-absolute'>Password</p>
            </div>

            <span className='text-danger small-error'>
              {formik.touched.password && formik.errors.password}
            </span>
          </div>

          {/* Normal Login Button */}
          <div className='field-container flexing flex-column'>

            <span className='forgot me-4'>
              Forgot Password?
            </span>

            <div className='login-field text-center flexing login-btn'>
              <button
                type='submit'
                className='text-light fs-5 w-100 border-0 bg-transparent'
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </div>

            <div className='flexing w-100 mt-3'>
              <div className='h-line'></div>

              <div className='text-dark px-2'>
                Or continue with
              </div>

              <div className='h-line'></div>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="field-container flexing flex-column">

            <div className="w-100 d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="continue_with"
                shape="rectangular"
                theme="outline"
                size="large"
                width="300"
                useOneTap={false}
              />
            </div>

          </div>

          {/* Registration Link */}
          <div className='text-center mt-2'>
            <span className='text-muted small'>
              Don't have an account? 
            </span>

            <Link
              to="/register"
              className='text-success fw-bold text-decoration-none'
            >
              Register here
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
