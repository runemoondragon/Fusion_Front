import axios from 'axios';

// Use NEXT_PUBLIC_API_BASE_URL for API calls typically under /api
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.mcp4.ai/api'  // Production URL
  : 'http://localhost:5000/api'; // Local development

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Optional: Add an interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    config.headers = config.headers || {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient; 