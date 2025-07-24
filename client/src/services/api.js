import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Utility to get token and handle missing token
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') {
    window.location.href = '/login';
    throw new Error('No valid token found. Redirecting to login.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Houses
export const getHouses = () => api.get('/houses');
export const getHouse = (id) => api.get(`/houses/${id}`);
export const createHouse = (data) => api.post('/houses', data);
export const updateHouse = (id, data) => api.put(`/houses/${id}`, data);
export const deleteHouse = (id) => api.delete(`/houses/${id}`);
export const getUnpaidHouses = () => api.get('/houses/unpaid');

// Tenants
export const getTenants = (propertyId) => api.get('/tenants', { params: { property: propertyId } });
export const createTenant = (data) => api.post('/tenants', data);
export const updateTenant = (id, data) => api.put(`/tenants/${id}`, data);
export const deleteTenant = (id) => api.delete(`/tenants/${id}`);

// Payments
export const recordPayment = (data) => api.post('/payments/record', data);
export const getPayments = () => api.get('/payments');

export default api; 