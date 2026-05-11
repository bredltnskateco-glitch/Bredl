const API_BASE = process.env.REACT_APP_API_URL || '/api';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_COOKIE = 'XSRF-TOKEN';

const readCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

let csrfBootstrapPromise = null;
const ensureCsrfToken = async () => {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  if (!csrfBootstrapPromise) {
    csrfBootstrapPromise = fetch(`${API_BASE}/auth/csrf`, {
      credentials: 'include',
    })
      .then((r) => r.json().catch(() => ({})))
      .catch(() => ({}))
      .finally(() => { csrfBootstrapPromise = null; });
  }
  await csrfBootstrapPromise;
  return readCookie(CSRF_COOKIE);
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

const request = async (path, { method = 'GET', body, params, headers = {} } = {}) => {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };

  if (!SAFE_METHODS.has(method)) {
    const csrf = await ensureCsrfToken();
    if (csrf) finalHeaders['X-CSRF-Token'] = csrf;
  }

  const res = await fetch(buildUrl(path, params), {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
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

export { ensureCsrfToken };
export default api;
