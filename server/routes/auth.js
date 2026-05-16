const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const { protect, SESSION_COOKIE } = require('../middleware/auth');
const { issueCsrfToken, clearCsrfToken } = require('../middleware/csrf');
const mailer = require('../services/mailer');
const { SECURITY_DISABLED } = require('../config/securityFlag');

const router = express.Router();

const SESSION_TTL_SECONDS = parseInt(process.env.JWT_EXPIRES_IN_SECONDS, 10) || 60 * 60; // 1h
const MFA_CHALLENGE_TTL_SECONDS = 5 * 60; // 5 minutes
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000; // 15 minutes

const hashResetToken = (raw) =>
  crypto.createHash('sha256').update(String(raw)).digest('hex');

authenticator.options = { window: 1, step: 30, digits: 6 };

const signSessionToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, purpose: 'session' },
    process.env.JWT_SECRET,
    {
      expiresIn: SESSION_TTL_SECONDS,
      issuer: 'rufus-macba-api',
      subject: String(user._id),
    },
  );

const signMfaChallengeToken = (user) =>
  jwt.sign(
    { id: user._id, purpose: 'mfa-challenge' },
    process.env.JWT_SECRET,
    {
      expiresIn: MFA_CHALLENGE_TTL_SECONDS,
      issuer: 'rufus-macba-api',
      subject: String(user._id),
    },
  );

const cookieBaseOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

const setSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE, token, {
    ...cookieBaseOptions(),
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE, cookieBaseOptions());
};

// Server-side password policy (audit item: strong password policy)
const validatePassword = (pw) => {
  if (typeof pw !== 'string' || pw.length === 0) return 'Password is required';
  if (SECURITY_DISABLED) return null;
  if (pw.length < 12) return 'Password must be at least 12 characters';
  if (pw.length > 128) return 'Password is too long';
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter';
  if (!/[0-9]/.test(pw)) return 'Password must include a digit';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must include a symbol';
  return null;
};

const isEmail = (s) =>
  typeof s === 'string' && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const clientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';

const securityLog = (event, details) => {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...details }));
};

const generateBackupCodes = async (count = 8) => {
  const plaintext = [];
  const hashed = [];
  for (let i = 0; i < count; i++) {
    // 10 chars hex, formatted as "abcde-12345" for readability
    const raw = crypto.randomBytes(5).toString('hex');
    const code = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    plaintext.push(code);
    const normalized = code.replace(/-/g, '').toLowerCase();
    hashed.push(await bcrypt.hash(normalized, 10));
  }
  return { plaintext, hashed };
};

// Bootstrap CSRF token for clients that haven't authenticated yet.
router.get('/csrf', (req, res) => {
  const token = issueCsrfToken(res);
  res.json({ csrfToken: token });
});

// ---------- Registration & login (stage 1) ----------

router.post('/register', asyncHandler(async (req, res) => {
  const {
    firstName, lastName, email, password,
    phone, street, city, postalCode, country, newsletter,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('firstName, lastName, email, and password are required');
  }
  if (!isEmail(email)) {
    res.status(400);
    throw new Error('Invalid email address');
  }
  const pwError = validatePassword(password);
  if (pwError) {
    res.status(400);
    throw new Error(pwError);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('Could not create account with the provided details');
  }

  const user = await User.create({
    firstName: String(firstName).slice(0, 60),
    lastName: String(lastName).slice(0, 60),
    email,
    password,
    phone: phone ? String(phone).slice(0, 30) : '',
    address: { street, city, postalCode, country },
    newsletter: !!newsletter,
    role: 'client', // never honor a client-supplied role
  });

  securityLog('user.register', { userId: String(user._id), email: user.email, ip: clientIp(req) });

  setSessionCookie(res, signSessionToken(user));
  issueCsrfToken(res);

  res.status(201).json({ user: user.toPublicJSON() });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || !isEmail(email)) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +failedLoginAttempts +lockedUntil +mfaSecret');

  if (!user) {
    securityLog('auth.login.fail', { email: email.toLowerCase(), reason: 'no_user', ip: clientIp(req) });
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!SECURITY_DISABLED && user.isLocked()) {
    securityLog('auth.login.locked', { userId: String(user._id), ip: clientIp(req) });
    res.status(423);
    throw new Error('Account temporarily locked. Try again later.');
  }

  const ok = await user.matchPassword(password);
  if (!ok) {
    if (!SECURITY_DISABLED) await user.registerFailedLogin();
    securityLog('auth.login.fail', { userId: String(user._id), reason: 'bad_password', ip: clientIp(req) });
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Stage 2 required: do not issue a session cookie yet.
  if (!SECURITY_DISABLED && user.mfaEnabled) {
    securityLog('auth.login.mfa_required', { userId: String(user._id), ip: clientIp(req) });
    return res.json({
      mfaRequired: true,
      challengeToken: signMfaChallengeToken(user),
    });
  }

  await user.registerSuccessfulLogin(clientIp(req));
  securityLog('auth.login.success', { userId: String(user._id), ip: clientIp(req) });

  setSessionCookie(res, signSessionToken(user));
  issueCsrfToken(res);

  res.json({
    user: user.toPublicJSON(),
    mfaSetupRequired: user.role === 'admin' && !user.mfaEnabled,
  });
}));

// ---------- Sign in with Google (Google Identity Services) ----------
//
// The frontend posts the ID token (JWT) returned by GIS. We verify it with
// Google's public keys, find-or-create a user keyed on the Google `sub` claim,
// and reuse the same session + MFA flow as password login. The route never
// trusts any user-supplied profile fields beyond what Google signs.

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleOAuthClient = googleClientId ? new OAuth2Client(googleClientId) : null;

router.post('/google', asyncHandler(async (req, res) => {
  if (!googleOAuthClient) {
    res.status(503);
    throw new Error('Sign in with Google is not configured on this server.');
  }

  const { credential } = req.body || {};
  if (!credential || typeof credential !== 'string') {
    res.status(400);
    throw new Error('Google credential is required');
  }

  let payload;
  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    securityLog('auth.google.verify_failed', { reason: err.message, ip: clientIp(req) });
    res.status(401);
    throw new Error('Google sign-in could not be verified');
  }

  if (!payload || !payload.sub || !payload.email) {
    res.status(401);
    throw new Error('Google sign-in did not return a usable profile');
  }
  if (payload.email_verified === false) {
    res.status(401);
    throw new Error('Your Google email is not verified');
  }

  const email = String(payload.email).toLowerCase();
  const googleId = String(payload.sub);

  // Find by Google sub first (preferred), then fall back to email so an
  // existing password account gets linked rather than duplicated.
  let user = await User.findOne({ googleId })
    .select('+failedLoginAttempts +lockedUntil +mfaSecret');
  if (!user) {
    user = await User.findOne({ email })
      .select('+failedLoginAttempts +lockedUntil +mfaSecret');
  }

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
      securityLog('auth.google.linked', { userId: String(user._id), ip: clientIp(req) });
    }
  } else {
    user = await User.create({
      firstName: String(payload.given_name || payload.name || 'New').slice(0, 60),
      lastName: String(payload.family_name || ' ').slice(0, 60) || ' ',
      email,
      googleId,
      role: 'client',
    });
    securityLog('auth.google.register', { userId: String(user._id), email, ip: clientIp(req) });
  }

  if (!SECURITY_DISABLED && user.isLocked()) {
    securityLog('auth.google.locked', { userId: String(user._id), ip: clientIp(req) });
    res.status(423);
    throw new Error('Account temporarily locked. Try again later.');
  }

  // Honour MFA the same way password login does. Google having 2FA on its
  // side does not exempt admins (or any user) from the app's own challenge.
  if (!SECURITY_DISABLED && user.mfaEnabled) {
    securityLog('auth.google.mfa_required', { userId: String(user._id), ip: clientIp(req) });
    return res.json({
      mfaRequired: true,
      challengeToken: signMfaChallengeToken(user),
    });
  }

  await user.registerSuccessfulLogin(clientIp(req));
  securityLog('auth.google.success', { userId: String(user._id), ip: clientIp(req) });

  setSessionCookie(res, signSessionToken(user));
  issueCsrfToken(res);

  res.json({
    user: user.toPublicJSON(),
    mfaSetupRequired: user.role === 'admin' && !user.mfaEnabled,
  });
}));

// Stage 2: verify TOTP / backup code, then issue the real session cookie.
router.post('/mfa/verify-login', asyncHandler(async (req, res) => {
  const { challengeToken, code, backupCode } = req.body || {};
  if (!challengeToken || (!code && !backupCode)) {
    res.status(400);
    throw new Error('Challenge token and an MFA code are required');
  }

  let decoded;
  try {
    decoded = jwt.verify(challengeToken, process.env.JWT_SECRET, { issuer: 'rufus-macba-api' });
  } catch (_) {
    res.status(401);
    throw new Error('Challenge expired. Please log in again.');
  }
  if (decoded.purpose !== 'mfa-challenge') {
    res.status(401);
    throw new Error('Invalid challenge');
  }

  const user = await User.findById(decoded.id).select('+mfaSecret +mfaBackupCodes');
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    res.status(400);
    throw new Error('MFA is not configured for this account');
  }

  let success = false;
  if (code) {
    success = authenticator.check(String(code).replace(/\s/g, ''), user.mfaSecret);
  } else if (backupCode) {
    success = await user.consumeBackupCode(backupCode);
  }

  if (!success) {
    if (!SECURITY_DISABLED) await user.registerFailedLogin();
    securityLog('auth.mfa.fail', { userId: String(user._id), ip: clientIp(req) });
    res.status(401);
    throw new Error('Invalid MFA code');
  }

  await user.registerSuccessfulLogin(clientIp(req));
  securityLog('auth.mfa.success', { userId: String(user._id), ip: clientIp(req) });

  setSessionCookie(res, signSessionToken(user));
  issueCsrfToken(res);

  res.json({ user: user.toPublicJSON() });
}));

// ---------- Session management ----------

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
}));

router.put('/me', protect, asyncHandler(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'address', 'newsletter'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  if (req.body.password !== undefined) {
    const pwError = validatePassword(req.body.password);
    if (pwError) {
      res.status(400);
      throw new Error(pwError);
    }
    req.user.password = req.body.password;
    securityLog('auth.password.change', { userId: String(req.user._id), ip: clientIp(req) });
  }
  await req.user.save();
  res.json({ user: req.user.toPublicJSON() });
}));

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  clearCsrfToken(res);
  res.json({ ok: true });
});

// ---------- Password reset ----------

// Request a reset email. Always 200 with the same body so callers cannot
// enumerate which emails are registered (audit item: user enumeration).
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  const generic = {
    ok: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  if (!email || !isEmail(email)) {
    securityLog('auth.forgot.invalid', { email: typeof email === 'string' ? email : null, ip: clientIp(req) });
    return res.json(generic);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    securityLog('auth.forgot.no_user', { email: email.toLowerCase(), ip: clientIp(req) });
    return res.json(generic);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashResetToken(rawToken);
  user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl.replace(/\/$/, '')}/reset-password/${rawToken}`;
  const text = [
    `Hi ${user.firstName || ''},`,
    '',
    'A password reset was requested for your Rufus MACBA account.',
    `Open this link within the next 15 minutes to choose a new password:`,
    resetUrl,
    '',
    'If you did not request this, you can ignore this email — your password will not change.',
  ].join('\n');

  try {
    await mailer.send({
      to: user.email,
      subject: 'Reset your Rufus MACBA password',
      text,
    });
  } catch (err) {
    // Do not surface mailer errors to the caller; just log them.
    securityLog('auth.forgot.mail_failed', { userId: String(user._id), error: err.message });
  }

  securityLog('auth.forgot.issued', { userId: String(user._id), ip: clientIp(req) });
  return res.json(generic);
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || typeof token !== 'string') {
    res.status(400);
    throw new Error('Reset token is required');
  }
  const pwError = validatePassword(password);
  if (pwError) {
    res.status(400);
    throw new Error(pwError);
  }

  const tokenHash = hashResetToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+password +passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) {
    securityLog('auth.reset.fail', { reason: 'invalid_or_expired', ip: clientIp(req) });
    res.status(400);
    throw new Error('Reset link is invalid or has expired');
  }

  user.password = password;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  // Defence in depth: clear any active lockout so the user can immediately log in
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  securityLog('auth.reset.success', { userId: String(user._id), ip: clientIp(req) });

  // Do NOT auto-log-in. Force the user through the normal login flow so MFA
  // applies, and so a stolen reset link alone never yields a session.
  res.json({ ok: true });
}));

// ---------- MFA enrollment ----------

router.post('/mfa/setup', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+mfaPendingSecret');
  if (user.mfaEnabled) {
    res.status(400);
    throw new Error('MFA is already enabled. Disable it before reconfiguring.');
  }
  const secret = authenticator.generateSecret();
  user.mfaPendingSecret = secret;
  await user.save();

  const issuer = 'Rufus MACBA';
  const otpauth = authenticator.keyuri(user.email, issuer, secret);
  const qrDataUrl = await qrcode.toDataURL(otpauth);

  securityLog('auth.mfa.setup_initiated', { userId: String(user._id), ip: clientIp(req) });

  res.json({ secret, otpauth, qrDataUrl });
}));

router.post('/mfa/enable', protect, asyncHandler(async (req, res) => {
  const { code } = req.body || {};
  if (!code) {
    res.status(400);
    throw new Error('TOTP code is required');
  }
  const user = await User.findById(req.user._id).select('+mfaPendingSecret +mfaSecret');
  if (user.mfaEnabled) {
    res.status(400);
    throw new Error('MFA is already enabled');
  }
  if (!user.mfaPendingSecret) {
    res.status(400);
    throw new Error('Start MFA setup before enabling it');
  }
  const ok = authenticator.check(String(code).replace(/\s/g, ''), user.mfaPendingSecret);
  if (!ok) {
    res.status(400);
    throw new Error('Invalid code');
  }

  const { plaintext, hashed } = await generateBackupCodes(8);
  user.mfaSecret = user.mfaPendingSecret;
  user.mfaPendingSecret = null;
  user.mfaBackupCodes = hashed;
  user.mfaEnabled = true;
  await user.save();

  securityLog('auth.mfa.enabled', { userId: String(user._id), ip: clientIp(req) });

  // Plaintext backup codes are returned ONCE — the client must show them now.
  res.json({ enabled: true, backupCodes: plaintext });
}));

router.post('/mfa/disable', protect, asyncHandler(async (req, res) => {
  const { code, backupCode, password } = req.body || {};
  if (!password) {
    res.status(400);
    throw new Error('Password is required to disable MFA');
  }
  const user = await User.findById(req.user._id)
    .select('+password +mfaSecret +mfaBackupCodes');
  if (!user.mfaEnabled) {
    res.status(400);
    throw new Error('MFA is not enabled');
  }
  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid password');
  }
  let confirmed = false;
  if (code) confirmed = authenticator.check(String(code).replace(/\s/g, ''), user.mfaSecret);
  if (!confirmed && backupCode) confirmed = await user.consumeBackupCode(backupCode);
  if (!confirmed) {
    res.status(401);
    throw new Error('Invalid MFA code');
  }

  user.mfaEnabled = false;
  user.mfaSecret = null;
  user.mfaPendingSecret = null;
  user.mfaBackupCodes = [];
  await user.save();

  securityLog('auth.mfa.disabled', { userId: String(user._id), ip: clientIp(req) });
  res.json({ enabled: false });
}));

router.post('/mfa/backup-codes', protect, asyncHandler(async (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }
  const user = await User.findById(req.user._id).select('+password +mfaBackupCodes');
  if (!user.mfaEnabled) {
    res.status(400);
    throw new Error('MFA is not enabled');
  }
  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid password');
  }
  const { plaintext, hashed } = await generateBackupCodes(8);
  user.mfaBackupCodes = hashed;
  await user.save();
  securityLog('auth.mfa.backup_regenerated', { userId: String(user._id), ip: clientIp(req) });
  res.json({ backupCodes: plaintext });
}));

module.exports = router;
