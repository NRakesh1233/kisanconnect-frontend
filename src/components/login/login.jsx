import './login.css';
import '../navbar/common.css';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  const [statusState, setStatusState] = useState({ message: "", type: "" }); // "success" or "error"
  const [isLoading, setIsLoading] = useState(false);

  let formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: yup.object({
      email: yup.string().email("Invalid email format!!").required("Email is required!!"),
      password: yup.string().min(8, "Password must be at least 8 characters!!").required("Password is required!!")
    }),
    onSubmit: (data) => {
      setIsLoading(true);
      setStatusState({ message: "", type: "" });

      // Keep using standard axios for login since user isn't authenticated yet
      axios.post("http://localhost:8080/public/user/login", data)
        .then((r) => {
          setStatusState({ message: r.data.message || "Login successful! Redirecting...", type: "success" });
          
          // STORE BOTH TOKENS HERE
          localStorage.setItem("Authorization", r.data.token);        // Access Token
          localStorage.setItem("refreshToken", r.data.refreshToken);  // Refresh Token
          localStorage.setItem("role", r.data.role);                  // User Role

          // Convert role to uppercase to handle differences like "farmer" or "ROLE_FARMER"
          const userRole = String(r.data.role).toUpperCase();

          setTimeout(() => {
            if (userRole.includes("FARMER")) {
              navigate("/dashboard");
            } else if (userRole.includes("CUSTOMER")) {
              navigate("/customer/home");
            } else {
              // Fallback if role is not recognized
              setStatusState({ message: `Unknown role: ${r.data.role}. Cannot redirect.`, type: "error" });
              setIsLoading(false); // Stop button loading state so it doesn't freeze
            }
          }, 1200);
        })
        .catch((error) => {
          setIsLoading(false); // Stop button loading state on error
          const errorMsg = error.response?.data?.message || "Login failed. Please check your credentials.";
          setStatusState({ message: errorMsg, type: "error" });
        });
    }
  });

  return (
    <div className='container-fluid login-page flexing'>
      <div className='login-img'>
        <div className="position-absolute z-10 glass-card flexing rounded-3 p-2 gap-2" style={{ bottom: "-60px", left: "40px" }}>
          <div className="rounded-circle badge1 bg-success flexing text-white mt-3" style={{ height: "50px", width: "50px" }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-success">Farm Fresh Legacy</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Connecting roots to tables since 2024.</p>
          </div>
        </div>
      </div>

      <div className='login-container flexing flex-column gap-3'>
        <div className='login-logo fs-5 text-success fw-bold'>
          <span className="material-symbols-outlined text-success fs-3">eco</span>KisanConnect
        </div>
        <h1 className='fw-bold'>Welcome Back</h1>
        <div className='text-success'>Login to continue shopping fresh farm products.</div>

        <form className={`login-card shadow-lg flexing flex-column justify-content-evenly ${statusState.type === 'error' ? 'shake-animation' : ''}`} id='login-card' onSubmit={formik.handleSubmit}>
          
          {/* Status Animation Notification Banner */}
          {statusState.message && (
            <div className={`status-banner ${statusState.type === 'success' ? 'status-success' : 'status-error'}`}>
              <span className="material-symbols-outlined">
                {statusState.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{statusState.message}</span>
            </div>
          )}

          <div className='field-container flexing flex-column my-4'>
            <div className={`login-field text-center flexing ${formik.touched.email && formik.errors.email ? 'field-error' : ''}`}>
              <span className="material-symbols-outlined fs-4">mail</span>
              <input type="email" name='email' onChange={formik.handleChange} value={formik.values.email} />
              <p className='position-absolute'>Email Address</p>
            </div>
            <span className='text-danger small-error'>{formik.errors.email}</span>
          </div>

          <div className='field-container flexing flex-column'>
            <div className={`login-field text-center flexing ${formik.touched.password && formik.errors.password ? 'field-error' : ''}`}>
              <span className="material-symbols-outlined">lock</span>
              <input type="password" name='password' onChange={formik.handleChange} value={formik.values.password} />
              <p className='position-absolute'>Password</p>
            </div>
            <span className='text-danger small-error'>{formik.errors.password}</span>
          </div>

          <div className='field-container flexing flex-column'>
            <span className='forgot me-4'>Forgot Password?</span>
            <div className='login-field text-center flexing login-btn'>
              <button type='submit' className='text-light fs-5 w-100 border-0 bg-transparent' disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </div>
            <div className='flexing w-100 mt-3'>
              <div className='h-line'></div>
              <div className='text-dark px-2'>Or continue with</div>
              <div className='h-line'></div>
            </div>
          </div>

          <div className='field-container flexing flex-column'>
            <div className='login-field text-center flexing bg-light text-dark cursor-pointer' onClick={() => alert("Google sign-in integration coming soon!")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              <span className='text-dark fs-6 fw-medium ps-2'>Continue with google</span>
            </div>
          </div>

          {/* Registration Link Prompt */}
          <div className='text-center mt-2'>
            <span className='text-muted small'>Don't have an account? </span>
            <Link to="/register" className='text-success fw-bold text-decoration-none'>Register here</Link>
          </div>

        </form>
      </div>
    </div>
  );
}