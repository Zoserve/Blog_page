import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api/v1';
export const API_SERVER_URL = API_BASE_URL.replace('/api/v1', '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 s — prevents forever-hanging requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    // Check localStorage first (rememberMe=true), then sessionStorage (rememberMe=false)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if on an admin route
      if (window.location.pathname.startsWith('/blog/admin')) {
        window.location.href = '/blog/login';
      }
    }
    return Promise.reject(error);
  }
);

export const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it points to local development database values, swap it with the active server URL
    if (url.includes('localhost:9090') || url.includes('localhost:8080') || url.includes('localhost:8081')) {
      const relativePathIndex = url.indexOf('/api/');
      if (relativePathIndex !== -1) {
        return `${API_SERVER_URL}${url.substring(relativePathIndex)}`;
      }
    }
    return url;
  }
  // Ensure it starts with a slash
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_SERVER_URL}${cleanUrl}`;
};

export default api;
