import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true, // This ensures cookies are sent with every request
  timeout: 10000,
});

// No request interceptor needed - cookies are automatically sent with withCredentials: true

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access, redirecting to login');
      // No need to clear localStorage since we're using cookies
      // You can add redirect logic here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
