require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const { csrfProtect } = require('./middleware/csrf');

// Fail fast on misconfiguration of secrets (audit item: DevSecOps / no defaults)
const REQUIRED_SECRETS = ['JWT_SECRET', 'MONGODB_URI'];
const PLACEHOLDER_SECRETS = new Set([
  'replace_with_long_random_string',
  'replace-this-with-a-long-random-string',
  'changeme',
  'secret',
]);
for (const key of REQUIRED_SECRETS) {
  const value = process.env[key];
  if (!value) {
    console.error(`[fatal] ${key} is not set. Configure server/.env before starting.`);
    process.exit(1);
  }
  if (key === 'JWT_SECRET' && (PLACEHOLDER_SECRETS.has(value) || value.length < 32)) {
    console.error('[fatal] JWT_SECRET is a placeholder or too short (need ≥32 chars). Generate with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
    process.exit(1);
  }
}

const app = express();

// Trust proxy so rate-limit / req.ip see the real client behind a CDN/load balancer
app.set('trust proxy', 1);

// Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// CORS allowlist (audit item: CORS hardening — never *)
// Production: strict allowlist from env.
// Development: also accept any http://localhost:* / http://127.0.0.1:* so the
// CRA proxy (which may rewrite Origin to its target) doesn't trip the check.
const stripTrailingSlash = (s) => (s || '').replace(/\/+$/, '');
const corsOrigins = new Set(
  (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => stripTrailingSlash(s.trim()))
    .filter(Boolean),
);
const localhostOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const isDev = process.env.NODE_ENV !== 'production';
app.use(cors({
  origin: (origin, cb) => {
    // Same-origin / curl / server-to-server (no Origin header)
    if (!origin) return cb(null, true);
    const normalized = stripTrailingSlash(origin);
    if (corsOrigins.has(normalized)) return cb(null, true);
    if (isDev && localhostOriginRegex.test(normalized)) return cb(null, true);
    return cb(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['X-CSRF-Token'],
}));

// Tighter body limits (audit item: input validation / DoS via huge payloads)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// Strip Mongo operator keys ($, .) from req.body / query / params (NoSQL injection)
app.use(mongoSanitize({ replaceWith: '_' }));
// Protect against HTTP Parameter Pollution
app.use(hpp());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Global API rate limit (audit item: rate limiting per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600, // ~40 req/min per IP, generous for browsing
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down.' },
});

// Stricter limit for auth-sensitive endpoints (audit item: brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many authentication attempts. Try again in 15 minutes.' },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api', apiLimiter);

// CSRF guard for cookie-authenticated state-changing requests
// (skipped automatically for safe methods and Bearer-token API clients).
app.use('/api', csrfProtect);

// Even stricter limiter for password reset, to slow down enumeration / brute force
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many password reset attempts. Try again later.' },
});

// Stricter limiter mounted before the auth router
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/mfa/verify-login', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/new-arrivals', require('./routes/newArrivals'));
app.use('/api/news', require('./routes/news'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/promos', require('./routes/promos'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
