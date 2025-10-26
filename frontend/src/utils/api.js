import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  forgotPassword: (data) => api.post('/auth/forgotpassword', data),
  resetPassword: (token, data) => api.put(`/auth/resetpassword/${token}`, data),
};

// Projects endpoints
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getRecommendations: () => api.get('/students/projects/recommendations'),
  getFeatured: () => api.get('/projects/featured'),
  getStats: () => api.get('/projects/stats'),
};

// Applications endpoints
export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  apply: (projectId, data) => api.post('/applications', { projectId, ...data }),
  getMyApplications: () => api.get('/applications/me/all'),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  withdraw: (id) => api.delete(`/applications/${id}`),
  getProjectApplications: (projectId, params) => api.get(`/applications/project/${projectId}`, { params }),
  shortlist: (id) => api.put(`/applications/${id}/shortlist`),
  approve: (id) => api.put(`/applications/${id}/approve`),
  reject: (id, data) => api.put(`/applications/${id}/reject`, data),
  scheduleInterview: (id, data) => api.put(`/applications/${id}/interview`, data),
  getStats: () => api.get('/applications/stats/overview'),
};

// Tests endpoints
export const testsAPI = {
  getAll: () => api.get('/tests'),
  getById: (id) => api.get(`/tests/${id}`),
  start: (id) => api.post(`/tests/${id}/start`),
  submitAnswer: (attemptId, data) => api.post(`/tests/attempts/${attemptId}/answer`, data),
  submit: (attemptId) => api.post(`/tests/attempts/${attemptId}/submit`),
  reportViolation: (attemptId, data) => api.post(`/tests/attempts/${attemptId}/violation`, data),
  getMyAttempts: () => api.get('/tests/attempts/me'),
  create: (data) => api.post('/admin/tests', data),
  update: (id, data) => api.put(`/admin/tests/${id}`, data),
  delete: (id) => api.delete(`/admin/tests/${id}`),
};

// Resume endpoints
export const resumeAPI = {
  getTemplates: () => api.get('/resumes/templates'),
  getMyResumes: () => api.get('/resumes/me'),
  createResume: (data) => api.post('/resumes', data),
  updateResume: (id, data) => api.put(`/resumes/${id}`, data),
  deleteResume: (id) => api.delete(`/resumes/${id}`),
  analyze: (id) => api.get(`/resumes/${id}/analyze`),
  export: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/resumes/${id}/export`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to export resume');
    }
    return response.blob();
  }
};

// Certificates endpoints
export const certificatesAPI = {
  getMyCertificates: () => api.get('/certificates/me'),
  verify: (certificateId) => api.get(`/certificates/${certificateId}/verify`),
  searchByHash: (hash) => api.get(`/certificates/search/${hash}`),
  issue: (data) => api.post('/admin/certificates', data),
  revoke: (id, data) => api.put(`/admin/certificates/${id}/revoke`, data),
};

// Notifications endpoints
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Companies endpoints
export const companiesAPI = {
  register: (data) => api.post('/companies/register', data),
  getApproved: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  getOpenSource: () => api.get('/companies/opensource'),
};

// Super Admin endpoints
export const superadminAPI = {
  getStats: () => api.get('/superadmin/stats'),
  getCompanies: (params) => api.get('/superadmin/companies', { params }),
  getCompany: (id) => api.get(`/superadmin/companies/${id}`),
  approveCompany: (id) => api.put(`/superadmin/companies/${id}/approve`),
  rejectCompany: (id, data) => api.put(`/superadmin/companies/${id}/reject`, data),
  suspendCompany: (id, data) => api.put(`/superadmin/companies/${id}/suspend`, data),
  reactivateCompany: (id) => api.put(`/superadmin/companies/${id}/reactivate`),
  updateSettings: (id, data) => api.put(`/superadmin/companies/${id}/settings`, data),
  deleteCompany: (id) => api.delete(`/superadmin/companies/${id}`),
};
