import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem('access_token', response.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings/', data),
  getAll: (params) => api.get('/bookings/', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  confirm: (id) => api.post(`/bookings/${id}/confirm`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  trackView: (id) => api.post(`/bookings/${id}/view`),
  getRecommendations: (limit = 10) => api.get('/bookings/recommendations', { params: { limit } }),
  getSimilar: (id, limit = 5) => api.get(`/bookings/${id}/similar`, { params: { limit } }),
};

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  changeRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  blockUser: (userId) => api.put(`/admin/users/${userId}/block`),
  unblockUser: (userId) => api.put(`/admin/users/${userId}/unblock`),
  getAllBookings: () => api.get('/admin/bookings'),
  getStatistics: () => api.get('/admin/statistics'),
};

export default api;