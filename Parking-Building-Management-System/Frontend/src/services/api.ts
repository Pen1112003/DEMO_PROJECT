import axios from 'axios';

// Base API URL can be loaded from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor to format errors consistently
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    // Standardize error formats according to the REST blueprint
    const standardizedError = {
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      status: error.response?.status || 500,
      details: error.response?.data?.error?.details || [],
    };
    return Promise.reject(standardizedError);
  }
);
