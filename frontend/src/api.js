import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL for all API requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Fixed: use 'authToken' instead of 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling 401 Unauthorized errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (expired/invalid token)
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');

      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
