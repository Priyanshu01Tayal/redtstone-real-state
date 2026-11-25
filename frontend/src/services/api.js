import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('redstone_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-clear if already on login/public page
      if (window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/broker') ||
        window.location.pathname.startsWith('/owner') ||
        window.location.pathname.startsWith('/client')) {
        localStorage.removeItem('redstone_token');
        localStorage.removeItem('redstone_user');
        window.location.href = '/login?session_expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
