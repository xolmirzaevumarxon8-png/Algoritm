import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Create a custom axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT tokens
apiClient.interceptors.request.use(
  (config) => {
    // Get token from authStore or localStorage
    const token = localStorage.getItem('token') || useAuthStore.getState().token;
    const lang = localStorage.getItem('i18nextLng') || 'uz';
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (config.headers) {
      config.headers['Accept-Language'] = lang;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to check token expiration and global errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized or 403 (invalid or expired token)
    if ((error.response?.status === 401 || (error.response?.status === 403 && error.response?.data?.message?.includes('expired'))) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Log user out globally
        useAuthStore.getState().logout();
        toast.error('Session expired. Please log in again.');
        // Redirect to login page
        window.location.href = '/login';
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    } else if (error.response) {
      // Global error handling for 4xx and 5xx errors
      const message = error.response.data?.message || 'An error occurred. Please try again.';
      if (error.response.status >= 500) {
         toast.error(`Server Error: ${message}`);
      } else if (error.response.status === 403) {
         toast.error(`Forbidden: ${message}`);
      } else {
         toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your internet connection and try again.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
