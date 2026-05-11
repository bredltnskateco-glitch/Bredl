const crypto = require('crypto');

// Double-submit cookie CSRF protection.
// - Server issues an unguessable token in a non-HttpOnly `XSRF-TOKEN` cookie
//   (readable by same-origin JS so the SPA can echo it in `X-CSRF-Token`).
// - On any state-changing request, server verifies that the header matches the
//   cookie using a constant-time comparison. Bearer-token API clients
//   (Authorization header) are exempt because cookie auth is not in play.

const CSRF_COOKIE = 'XSRF-TOKEN';
const CSRF_HEADER = 'x-csrf-token';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const cookieBaseOptions = () => ({
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

const issueCsrfToken = (res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    ...cookieBaseOptions(),
    httpOnly: false, // intentional: must be readable by same-origin JS
    maxAge: 12 * 60 * 60 * 1000, // 12h
  });
  return token;
};

const clearCsrfToken = (res) => {
  res.clearCookie(CSRF_COOKIE, { ...cookieBaseOptions(), httpOnly: false });
};

const timingSafeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
};

const csrfProtect = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  // Pure Bearer-token API consumers (e.g. server-to-server) don't carry the
  // session cookie, so CSRF doesn't apply to them. If there is no session
  // cookie attached to the request, skip the check.
  const hasSessionCookie = req.cookies && req.cookies.rufus_sid;
  if (!hasSessionCookie) return next();

  const cookieToken = req.cookies && req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];
  if (!cookieToken || !headerToken || !timingSafeEqual(cookieToken, headerToken)) {
    res.status(403);
    return next(new Error('Invalid CSRF token'));
  }
  next();
};

module.exports = {
  CSRF_COOKIE,
  CSRF_HEADER,
  issueCsrfToken,
  clearCsrfToken,
  csrfProtect,
};
