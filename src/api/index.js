import api, { ensureCsrfToken } from './client';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateMe: (payload) => api.put('/auth/me', payload),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const mfaApi = {
  verifyLogin: (challengeToken, { code, backupCode }) =>
    api.post('/auth/mfa/verify-login', { challengeToken, code, backupCode }),
  setup: () => api.post('/auth/mfa/setup'),
  enable: (code) => api.post('/auth/mfa/enable', { code }),
  disable: (payload) => api.post('/auth/mfa/disable', payload),
  regenerateBackupCodes: (password) => api.post('/auth/mfa/backup-codes', { password }),
};

export const productsApi = {
  list: (params) => api.get('/products', params),
  get: (id) => api.get(`/products/${id}`),
  create: (payload) => api.post('/products', payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
  remove: (id) => api.del(`/products/${id}`),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (payload) => api.post('/categories', payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.del(`/categories/${id}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (payload) => api.post('/cart', payload),
  update: (payload) => api.put('/cart/item', payload),
  remove: (payload) => api.del('/cart/item', payload),
  clear: () => api.del('/cart'),
  merge: (items) => api.post('/cart/merge', { items }),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.del(`/wishlist/${productId}`),
  clear: () => api.del('/wishlist'),
  merge: (items) => api.post('/wishlist/merge', { items }),
};

export const ordersApi = {
  create: (payload) => api.post('/orders', payload),
  mine: () => api.get('/orders/mine'),
  list: (params) => api.get('/orders', params),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  remove: (id) => api.del(`/orders/${id}`),
};

export const customersApi = {
  list: (params) => api.get('/customers', params),
  get: (id) => api.get(`/customers/${id}`),
};

export const newArrivalsApi = {
  list: () => api.get('/new-arrivals'),
  create: (payload) => api.post('/new-arrivals', payload),
  update: (id, payload) => api.put(`/new-arrivals/${id}`, payload),
  remove: (id) => api.del(`/new-arrivals/${id}`),
};

export const newsApi = {
  list: () => api.get('/news'),
  get: (id) => api.get(`/news/${id}`),
  create: (payload) => api.post('/news', payload),
  update: (id, payload) => api.put(`/news/${id}`, payload),
  remove: (id) => api.del(`/news/${id}`),
};

export const newsletterApi = {
  subscribe: (email) => api.post('/newsletter', { email }),
  unsubscribe: (email) => api.del(`/newsletter/${encodeURIComponent(email)}`),
  list: () => api.get('/newsletter'),
};

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  sales: (days = 30) => api.get('/analytics/sales', { days }),
  topProducts: (limit = 10) => api.get('/analytics/top-products', { limit }),
};

export const promosApi = {
  validate: (code, subtotal) => api.post('/promos/validate', { code, subtotal }),
  list: () => api.get('/promos'),
  create: (payload) => api.post('/promos', payload),
  update: (id, payload) => api.put(`/promos/${id}`, payload),
  remove: (id) => api.del(`/promos/${id}`),
};

export { ensureCsrfToken };
export default api;
