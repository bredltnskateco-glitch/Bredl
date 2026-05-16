// Shared admin formatters. Single source of truth for currency, dates, and
// display names so each manager renders consistently.

export const formatCurrency = (value, { decimals = 0, currency = 'TND' } = {}) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${currency}`;
};

export const formatDate = (value, { withTime = false } = {}) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  if (withTime) return d.toLocaleString();
  return d.toLocaleDateString();
};

export const customerName = (userOrOrder) => {
  if (!userOrOrder) return 'Guest';
  const u = userOrOrder.user || userOrOrder;
  const first = (u.firstName || '').trim();
  const last = (u.lastName || '').trim();
  const full = `${first} ${last}`.trim();
  if (full) return full;
  if (u.name) return u.name;
  if (u.email) return u.email;
  return 'Customer';
};

export const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const truncate = (text, max = 80) => {
  const s = String(text || '');
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};
