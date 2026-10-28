import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('Authorization');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Catch 401 OR 403 errors and trigger token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

     // Check for 401 (Unauthorized) or 403 (Forbidden due to expired/invalid token)
    const status = error.response ? error.response.status : null;

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          console.log("No refresh token found")
          throw new Error("No refresh token found");
        }

        console.log("Token expired/unauthorized (status " + status + "). Requesting new access token...");

        // Call backend refresh route
        const response = await axios.post(`${API_BASE_URL}/public/user/auth/refresh`, {
          refreshToken: refreshToken
        });

        const newAccessToken = response.data.token;
        localStorage.setItem('Authorization', newAccessToken);

        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        console.log("Token refreshed successfully!"+newAccessToken);

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        // If refresh fails, reject queue and force logout
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('Authorization');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;