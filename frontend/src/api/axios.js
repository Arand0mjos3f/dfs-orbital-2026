// src/api/axios.js
import axios from 'axios';

// Create a globally configured Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Set a reasonable timeout for mobile connections
  timeout: 10000, 
});

// Request Interceptor: Attach the Auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage (or your preferred state manager)
    const token = localStorage.getItem('dfs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g., token expiration)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., clear token, redirect to login)
      localStorage.removeItem('dfs_token');
      window.location.href = '/login'; // Force redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;