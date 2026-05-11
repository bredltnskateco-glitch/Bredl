const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
// auth logic goes here, do not hardcode any password in this file.
// All passwords are hashed by the User model pre-save hook.

const SESSION_COOKIE = 'rufus_sid';

const extractToken = (req) => {
  if (req.cookies && req.cookies[SESSION_COOKIE]) return req.cookies[SESSION_COOKIE];
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
};

const verifySessionToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'rufus-macba-api',
  });
  if (decoded.purpose && decoded.purpose !== 'session') {
    const err = new Error('Wrong token purpose');
    err.code = 'WRONG_PURPOSE';
    throw err;
  }
  return decoded;
};

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no session');
  }
  try {
    const decoded = verifySessionToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('User no longer exists');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, session invalid');
  }
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  throw new Error('Admin access required');
};

// Audit item: mandatory MFA for admins. Mounted on write endpoints; read-only
// admin endpoints stay accessible so the operator can browse and configure MFA.
const requireMfa = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  if (req.user.role === 'admin' && !req.user.mfaEnabled) {
    res.status(403);
    throw new Error('MFA must be enabled to perform this action');
  }
  next();
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifySessionToken(token);
    req.user = await User.findById(decoded.id);
  } catch (_) {
    // ignore - keep request unauthenticated
  }
  next();
});

module.exports = {
  protect,
  adminOnly,
  requireMfa,
  optionalAuth,
  SESSION_COOKIE,
};
