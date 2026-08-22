import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hiresense-ai-backend-km18.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  forgotPassword: async (email, new_password, confirm_password) => {
    const response = await api.post('/auth/forgot-password', { email, new_password, confirm_password });
    return response.data;
  },
  changePassword: async (current_password, new_password, confirm_password) => {
    const response = await api.post('/auth/change-password', { current_password, new_password, confirm_password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const analysisService = {
  analyzeResume: async (formData) => {
    const response = await api.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  matchJob: async (job_title, job_description, resume_text = '') => {
    const response = await api.post('/jobs/match', { job_title, job_description, resume_text });
    return response.data;
  },
  analyzeSpeech: async (formData) => {
    const response = await api.post('/speech/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/history');
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },
  getCareerInsights: async () => {
    const response = await api.get('/career-insights');
    return response.data;
  }
};


export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  }
};

export default api;
