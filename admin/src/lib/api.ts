import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Support dynamic API URLs via environment variables or current window origin
const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? window.location.port === '5000'
      ? 'http://localhost:4000'
      : window.location.origin
    : 'http://localhost:4000');

export const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
