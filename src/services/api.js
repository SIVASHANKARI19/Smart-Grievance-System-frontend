
 import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to include the JWT token

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Most common pattern
      // config.headers['x-auth-token'] = token; // Can be adjusted depending on backend's exact expectation, though Bearer is standard
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
