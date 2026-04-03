import api from './api';
import axios from 'axios';

// AI base URL from environment
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:5000';

export const grievanceService = {

  classify: async (description, repeatCount = 1) => {
    try {
      const response = await axios.post(
        `${AI_URL}/classify`,
        {
          description,
          repeatCount
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;

    } catch (error) {
      console.error("AI classify error:", error);
      throw error;
    }
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
  
  getCountByDepartment: async (dept) => {
    try {
      const response = await api.get(`/grievances/department/${encodeURIComponent(dept)}`);
      return Array.isArray(response.data) ? response.data.length : 0;
    } catch {
      return 0;
    }
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/grievances/${id}/status`, { status });
    return response.data;
  }
};