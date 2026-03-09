import api from './api';
import axios from 'axios';

export const grievanceService = {
  classify: async (description, repeatCount = 1) => {
    // Call the AI Classification API via Vite proxy to avoid CORS
    const response = await axios.post('/classify', {
      description,
      repeatCount
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/grievances', data);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/grievances');
    return response.data;
  },
  
  getByDepartment: async (dept) => {
    const response = await api.get(`/grievances/department/${dept}`);
    return response.data;
  },
  
  // Fetch only the count of grievances for a department (used for repeatCount calculation)
  getCountByDepartment: async (dept) => {
    try {
      const response = await api.get(`/grievances/department/${encodeURIComponent(dept)}`);
      return Array.isArray(response.data) ? response.data.length : 0;
    } catch {
      return 0; // If it fails, gracefully fall back to 0
    }
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/grievances/${id}/status`, { status });
    return response.data;
  }
};
