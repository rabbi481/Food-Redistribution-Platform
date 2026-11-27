import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // Only redirect if protected route
        // localStorage.removeItem('foodbridge_token');
        // localStorage.removeItem('foodbridge_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Users Endpoints
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Donations Endpoints
export const donationsAPI = {
  getAll: (params) => api.get('/donations', { params }),
  getMyDonations: () => api.get('/donations/my'),
  getById: (id) => api.get(`/donations/${id}`),
  create: (data) => api.post('/donations', data),
  update: (id, data) => api.put(`/donations/${id}`, data),
  delete: (id) => api.delete(`/donations/${id}`),
};

// Requests Endpoints
export const requestsAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  updateStatus: (id, data) => api.put(`/requests/${id}`, data),
};

// Volunteer Endpoints
export const volunteerAPI = {
  getAvailableTasks: () => api.get('/volunteer/tasks'),
  getMyTasks: () => api.get('/volunteer/my-tasks'),
  acceptTask: (id) => api.post(`/volunteer/tasks/${id}/accept`),
  updateStatus: (id, data) => api.put(`/volunteer/tasks/${id}/status`, data),
};

// Dashboard Stats Endpoint
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
