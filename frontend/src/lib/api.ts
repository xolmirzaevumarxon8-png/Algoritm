import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toast.error('Session expired. Please log in again.');
          useAuthStore.getState().logout();
          window.location.href = '/login';
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          // Redirect to forbidden page if needed
          break;
        case 404:
          toast.error('The requested resource was not found.');
          break;
        case 422:
          toast.error('Validation error. Please check your inputs.');
          break;
        case 500:
          toast.error('Internal server error. Our team has been notified.');
          break;
        default:
          toast.error(error.response.data?.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your internet connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);

export default api;
