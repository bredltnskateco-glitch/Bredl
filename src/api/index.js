import api, { ensureCsrfToken } from './client';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  loginWithGoogle: (credential) => api.post('/auth/google', { credential }),
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

// Single-flight + 60s TTL memo for categories. Concurrent callers share one
// in-flight request; mutations invalidate the cache so subsequent reads refetch.
const CATEGORIES_TTL_MS = 60_000;
let _categoriesPromise = null;
let _categoriesAt = 0;
const invalidateCategories = () => { _categoriesPromise = null; _categoriesAt = 0; };

export const categoriesApi = {
  list: () => {
    const fresh = _categoriesPromise && (Date.now() - _categoriesAt < CATEGORIES_TTL_MS);
    if (!fresh) {
      _categoriesAt = Date.now();
      _categoriesPromise = api.get('/categories').catch((err) => {
        // Don't poison the cache with a failure — let the next caller retry.
        _categoriesPromise = null;
        _categoriesAt = 0;
        throw err;
      });
    }
    return _categoriesPromise;
  },
  create: async (payload) => {
    const r = await api.post('/categories', payload);
    invalidateCategories();
    return r;
  },
  update: async (id, payload) => {
    const r = await api.put(`/categories/${id}`, payload);
    invalidateCategories();
    return r;
  },
  remove: async (id) => {
    const r = await api.del(`/categories/${id}`);
    invalidateCategories();
    return r;
  },
  invalidate: invalidateCategories,
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

// Single-flight + 60s TTL memo for public site settings. Used by Footer,
// AnnouncementBar, Header. Admin GET/save bypass the memo and invalidate it.
const SETTINGS_TTL_MS = 60_000;
let _settingsPromise = null;
let _settingsAt = 0;
const invalidateSettings = () => { _settingsPromise = null; _settingsAt = 0; };

// Collections + Brands — drive Shop FeaturedCollections / TopBrands strips.
const COLLECTIONS_TTL_MS = 60_000;
let _collectionsPromise = null;
let _collectionsAt = 0;
const invalidateCollections = () => { _collectionsPromise = null; _collectionsAt = 0; };

export const collectionsApi = {
  list: () => {
    const fresh = _collectionsPromise && (Date.now() - _collectionsAt < COLLECTIONS_TTL_MS);
    if (!fresh) {
      _collectionsAt = Date.now();
      _collectionsPromise = api.get('/collections').catch((err) => {
        _collectionsPromise = null;
        _collectionsAt = 0;
        throw err;
      });
    }
    return _collectionsPromise;
  },
  adminList: () => api.get('/collections/all'),
  create: async (payload) => {
    const r = await api.post('/collections', payload);
    invalidateCollections();
    return r;
  },
  update: async (id, payload) => {
    const r = await api.put(`/collections/${id}`, payload);
    invalidateCollections();
    return r;
  },
  remove: async (id) => {
    const r = await api.del(`/collections/${id}`);
    invalidateCollections();
    return r;
  },
  invalidate: invalidateCollections,
};

const BRANDS_TTL_MS = 60_000;
let _featuredBrandsPromise = null;
let _featuredBrandsAt = 0;
const invalidateBrands = () => { _featuredBrandsPromise = null; _featuredBrandsAt = 0; };

export const brandsApi = {
  list: () => api.get('/brands'),
  featuredList: () => {
    const fresh = _featuredBrandsPromise && (Date.now() - _featuredBrandsAt < BRANDS_TTL_MS);
    if (!fresh) {
      _featuredBrandsAt = Date.now();
      _featuredBrandsPromise = api.get('/brands/featured').catch((err) => {
        _featuredBrandsPromise = null;
        _featuredBrandsAt = 0;
        throw err;
      });
    }
    return _featuredBrandsPromise;
  },
  create: async (payload) => {
    const r = await api.post('/brands', payload);
    invalidateBrands();
    return r;
  },
  update: async (id, payload) => {
    const r = await api.put(`/brands/${id}`, payload);
    invalidateBrands();
    return r;
  },
  remove: async (id) => {
    const r = await api.del(`/brands/${id}`);
    invalidateBrands();
    return r;
  },
  invalidate: invalidateBrands,
};

export const settingsApi = {
  publicGet: () => {
    const fresh = _settingsPromise && (Date.now() - _settingsAt < SETTINGS_TTL_MS);
    if (!fresh) {
      _settingsAt = Date.now();
      _settingsPromise = api.get('/settings/public').catch((err) => {
        _settingsPromise = null;
        _settingsAt = 0;
        throw err;
      });
    }
    return _settingsPromise;
  },
  adminGet: () => api.get('/settings'),
  save: async (payload) => {
    const r = await api.put('/settings', payload);
    invalidateSettings();
    return r;
  },
  invalidate: invalidateSettings,
};

export { ensureCsrfToken };
export default api;
