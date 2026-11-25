import axios from 'axios';

const defaultHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || `http://${defaultHost}:8000/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autocheck_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {

      localStorage.removeItem('autocheck_token');
      localStorage.removeItem('autocheck_user');
    }
    return Promise.reject(error);
  }
);

export default api;
