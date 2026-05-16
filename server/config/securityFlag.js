// !!! TEMPORARY DEVELOPMENT KILL-SWITCH !!!
//
// When SECURITY_DISABLED === true the server bypasses:
//   - Rate limiting (global API, auth, password-reset)
//   - CSRF double-submit verification
//   - Helmet security headers (CSP, X-Frame-Options, etc.)
//   - express-mongo-sanitize (NoSQL operator injection guard)
//   - hpp (HTTP parameter pollution guard)
//   - Strict CORS allowlist (replaced with permissive reflect-origin)
//   - 100kb body-size limit (raised to 50mb)
//   - JWT_SECRET minimum-length / placeholder check
//   - Strong password policy (length, complexity)
//   - Account lockout after repeated failed logins
//   - MFA requirement for admin write actions
//   - Admin-role check (every authenticated user behaves like an admin)
//   - User schema `minlength` enforcement on password
//
// Still active: bcrypt password hashing, JWT signing, the `protect` middleware
// (so `req.user` is still populated on authenticated routes), and HttpOnly
// session cookies. See SECURITY_DISABLED.md at the repo root for the full
// list and the re-enable procedure.
//
// FLIP TO `false` BEFORE DEPLOYING.
const SECURITY_DISABLED = false;

module.exports = { SECURITY_DISABLED };
