import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const uploadFile = (file, cpseName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('cpseName', cpseName);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMaterials = (cpse) => api.get('/materials', { params: { cpse } });
export const runMatching = () => api.post('/match/run');
export const getMatches = (filters) => api.get('/matches', { params: filters });
export const endorseMatch = (id, payload) => api.post(`/match/${id}/endorse`, payload);
export const approveMatch = (id, user) => api.post(`/match/${id}/approve`, { user });
export const rejectMatch = (id, user) => api.post(`/match/${id}/reject`, { user });
export const getUnifiedMaterials = () => api.get('/master');
export const getDashboardStats = () => api.get('/dashboard/stats');
export const searchMaterials = (query) => api.get('/materials/search', { params: { query } });
export const sendChatMessage = (message) => api.post('/chat', { message });
export const getGraphData = () => api.get('/graph');
export const getAuditLog = () => api.get('/audit');

// Authentication Endpoints
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const googleAuth = (googleData) => api.post('/auth/google', googleData);
// ERP / SAP Integration Endpoints
export const getErpStatus = () => api.get('/erp/status');
export const getSapMatmas = () => api.get('/erp/sap-matmas');
export const triggerErpSync = (cpse) => api.post('/erp/sync', { cpse });

export default api;
