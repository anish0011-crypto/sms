import axios from 'axios';

// Use production API base URL from environment (Vercel) if provided;
// otherwise fall back to local network/localhost auto-detection for development.
const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const backendHost = window.location.hostname || 'localhost';
const defaultBaseUrl = `http://${backendHost}:5000/api`;
const baseURL = envBaseUrl ? (envBaseUrl.endsWith('/') ? envBaseUrl.slice(0, -1) : envBaseUrl) : defaultBaseUrl;

const API = axios.create({ baseURL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rkd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rkd_token');
      localStorage.removeItem('rkd_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
