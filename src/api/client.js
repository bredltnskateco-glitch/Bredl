const API_BASE = process.env.REACT_APP_API_URL || '/api';

const TOKEN_KEY = 'rufus_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const buildUrl = (path, params) => {
  const base = path.startsWith('http') ? path : `${API_BASE}${path}`;
  if (!params) return base;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    search.append(k, v);
  });
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
};

const request = async (path, { method = 'GET', body, params, auth = true, headers = {} } = {}) => {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, params), {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const message = (data && data.message) || res.statusText || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const api = {
  get: (path, params, opts) => request(path, { method: 'GET', params, ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  del: (path, body, opts) => request(path, { method: 'DELETE', body, ...opts }),
};

export default api;
