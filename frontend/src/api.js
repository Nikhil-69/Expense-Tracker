import axios from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const axiosInstance = axios.create();

// Add request interceptor to include userId
axiosInstance.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    if (config.params) {
      config.params.userId = userData.userId;
    } else if (config.method === 'get' || config.method === 'delete') {
      config.params = { userId: userData.userId };
    }
    if (config.data) {
      config.data.userId = userData.userId;
    }
  }
  return config;
});

// API wrapper
export const api = {
  get: (endpoint) => axiosInstance.get(`${API_URL}${endpoint}`),
  post: (endpoint, data) => axiosInstance.post(`${API_URL}${endpoint}`, data),
  delete: (endpoint) => axiosInstance.delete(`${API_URL}${endpoint}`)
};
