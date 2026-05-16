# SECURITY DISABLED — DEV MODE

> **DO NOT DEPLOY WHILE THIS DOCUMENT IS RELEVANT.**
> Every safeguard in the list below has been turned off so the developer can
> work without auth/CSRF/rate-limit friction. Before any production deploy,
> flip the kill-switch off and run the verification checklist at the bottom.

---

## The Kill-Switch

A single flag controls every disabled feature:

- **File:** `server/config/securityFlag.js`
- **Constant:** `SECURITY_DISABLED`
- **Current value:** `true`
- **To re-enable everything:** change the constant to `false` and restart the server.

The flag is read at module load time, so a server restart is required after flipping.

When `SECURITY_DISABLED === true`, the server prints a loud warning on boot:

```
  !!  SECURITY_DISABLED=true  --  helmet, CSRF, rate-limits, CORS allowlist,
                                  mongo-sanitize, HPP, password policy,
                                  MFA & admin checks are all bypassed.
  !!  See SECURITY_DISABLED.md for the re-enable checklist before deploying.
```

If you ever see that warning in a production log, **stop the deploy and fix it.**

---

## What Stays Enabled (Safe to Leave On)

These are not features that block development, so they were left untouched:

- **bcrypt password hashing** (User model `pre('save')` hook, cost 12). Disabling it would corrupt existing logins.
- **`protect` middleware** on routes that need `req.user._id` (cart, wishlist, orders, /me). Without it those endpoints crash.
- **JWT signing & verification.** Sessions still issue/verify tokens.
- **`JWT_SECRET` & `MONGODB_URI` env-variable presence checks.** The server still exits if either is missing.
- **HttpOnly / SameSite=lax / Secure (prod-only) cookie flags.**
- **Morgan request logging** and the `securityLog()` JSON audit log.
- **Trust-proxy setting** (`app.set('trust proxy', 1)`).

---

## What Is Disabled (Behind the Flag)

### 1. Express-level middleware — `server/server.js`

| Feature                                     | Behaviour when disabled                                                                |
|---------------------------------------------|-----------------------------------------------------------------------------------------|
| **Helmet** (CSP, X-Frame-Options, etc.)     | Not mounted. Responses ship without security headers.                                  |
| **CORS strict allowlist**                   | Replaced with permissive reflect-origin (`origin: (o, cb) => cb(null, o || true)`). Any origin allowed, credentials still on. `PATCH` added to allowed methods. |
| **express-mongo-sanitize** (`$`/`.` strip)  | Not mounted. NoSQL operator-injection guard off.                                       |
| **hpp** (HTTP Parameter Pollution guard)    | Not mounted.                                                                            |
| **Global API rate limit** (`/api`, 600/15m) | Not mounted.                                                                            |
| **Auth rate limiter** (`/auth/login`, 10/15m, etc.) | Not mounted on `login`, `register`, `mfa/verify-login`, `forgot-password`, `reset-password`. |
| **JSON / urlencoded body size** (100 KB)    | Raised to 50 MB.                                                                        |
| **JWT_SECRET strength check**               | Presence still required; minimum-length-32 + placeholder-blacklist check skipped.      |

### 2. CSRF — `server/middleware/csrf.js`

| Feature                  | Behaviour when disabled                                                                                                |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `csrfProtect` middleware | Returns `next()` immediately. The double-submit cookie/header comparison is never performed.                            |
| `issueCsrfToken`         | Still issues an `XSRF-TOKEN` cookie on `/auth/csrf`, register, login, mfa-verify — left on so the SPA flow is unchanged. |

### 3. Authorization — `server/middleware/auth.js`

| Feature        | Behaviour when disabled                                                              |
|----------------|---------------------------------------------------------------------------------------|
| `adminOnly`    | Returns `next()` immediately. **Any logged-in user can hit admin endpoints.**          |
| `requireMfa`   | Returns `next()` immediately. **Admin write endpoints no longer require enrolled MFA.**|
| `protect`      | Unchanged — still required for routes that read `req.user`.                            |
| `optionalAuth` | Unchanged.                                                                             |

### 4. Auth routes — `server/routes/auth.js`

| Feature                                 | Behaviour when disabled                                                            |
|-----------------------------------------|-------------------------------------------------------------------------------------|
| `validatePassword` (length/case/digit/symbol) | Reduces to "must be a non-empty string". Any character / length accepted.     |
| Account lockout (`user.isLocked()` check on login) | Skipped — locked-out accounts can still attempt to log in.                |
| Failed-login counter (`registerFailedLogin`)       | Not incremented on bad password or bad MFA code.                          |
| **MFA challenge step on login**                    | Skipped — if a user has `mfaEnabled = true`, login still issues the session cookie directly instead of returning a `challengeToken`. |

### 5. User schema — `server/models/User.js`

| Feature                                 | Behaviour when disabled                                                            |
|-----------------------------------------|-------------------------------------------------------------------------------------|
| `password` schema `minlength: 12`       | Lowered to `minlength: 1`. Short passwords pass schema validation.                 |
| `BCRYPT_COST = 12` & `pre('save')` hash | **Unchanged** — passwords are still hashed on save. (Disabling this would lock existing users out.) |

### 6. Frontend (`src/api/client.js`)

**No changes.** The client still tries to fetch a CSRF token and attach `X-CSRF-Token` to unsafe requests. The server simply ignores those headers while disabled. No code change needed to re-enable.

---

## File-by-File Diff Summary

| File                                | Lines added                                                                                       |
|-------------------------------------|----------------------------------------------------------------------------------------------------|
| `server/config/securityFlag.js`     | **NEW** — exports `SECURITY_DISABLED` constant.                                                    |
| `server/server.js`                  | Imports flag, gates helmet / CORS strict / mongo-sanitize / hpp / rate-limits / body-limit / JWT_SECRET strength check. |
| `server/middleware/auth.js`         | Imports flag, gates `adminOnly` and `requireMfa` to a no-op pass-through.                          |
| `server/middleware/csrf.js`         | Imports flag, gates `csrfProtect` to a no-op pass-through.                                         |
| `server/routes/auth.js`             | Imports flag, gates `validatePassword`, account lockout, failed-login counter, MFA challenge gate. |
| `server/models/User.js`             | Imports flag, lowers `password` schema minlength to 1 while disabled.                              |

`grep -rn "SECURITY_DISABLED" server/` will list every gated branch in one shot.

---

## How to Re-Enable Before Deploying

1. Open `server/config/securityFlag.js`.
2. Change `const SECURITY_DISABLED = true;` → `const SECURITY_DISABLED = false;`.
3. (Optional but recommended) Delete the file once nothing references it and revert each import & branch — `grep -rn "SECURITY_DISABLED" server/` will list every site. Leaving the flag in place at `false` is also fine.
4. Make sure the production env has:
   - `JWT_SECRET` ≥ 32 chars (generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `CORS_ORIGIN` set to the real frontend origin(s) (comma-separated)
   - `NODE_ENV=production` (enables `Secure` cookies + CSP)
5. Restart the server.

---

## Verification Checklist (Run All Before Production)

Spin up the server with `SECURITY_DISABLED = false` and confirm each item:

- [ ] **Boot warning gone.** No `SECURITY_DISABLED=true` line in the startup log.
- [ ] **Helmet headers.** `curl -I http://localhost:5000/api/health` shows `X-Frame-Options`, `Strict-Transport-Security` (prod), `Content-Security-Policy` (prod), `Referrer-Policy`.
- [ ] **CORS rejects bad origins.** `curl -i -H 'Origin: https://evil.com' http://localhost:5000/api/products` returns a CORS error (or no `Access-Control-Allow-Origin`).
- [ ] **CSRF blocks unsafe requests without token.** `curl -i -X POST http://localhost:5000/api/cart -H 'Content-Type: application/json' --cookie 'rufus_sid=<real-session>'` returns `403 Invalid CSRF token` when the `X-CSRF-Token` header is missing.
- [ ] **Rate limit kicks in.** Hammer `POST /api/auth/login` 11 times in 15 min → response 429.
- [ ] **Body size cap.** `curl -X POST http://localhost:5000/api/products -H 'Content-Type: application/json' --data "$(head -c 200000 /dev/urandom | base64)"` returns 413 (Payload Too Large).
- [ ] **NoSQL injection blocked.** `curl 'http://localhost:5000/api/products?category[$ne]=null'` — `$ne` should be sanitized into a literal `_ne` and the query returns nothing weird.
- [ ] **Password policy enforced.** `POST /api/auth/register` with `password: "short"` returns 400 with the policy message.
- [ ] **Account lockout works.** Six bad logins for the same email → 423 Locked.
- [ ] **Admin endpoints reject non-admins.** `GET /api/customers` with a client session returns 403.
- [ ] **MFA required for admin writes.** Admin without `mfaEnabled` hits `POST /api/products` → 403 "MFA must be enabled".
- [ ] **JWT_SECRET strength gate.** Setting `JWT_SECRET=secret` in env → server exits with `[fatal] JWT_SECRET is a placeholder or too short`.
- [ ] **HTTPS / HSTS.** TLS terminated at the edge, `Strict-Transport-Security` header present, redirect from `http://` to `https://`.
- [ ] **Cookies `Secure` flag.** In production (`NODE_ENV=production`), `Set-Cookie` for `rufus_sid` and `XSRF-TOKEN` includes `Secure`.

---

## Re-Enable Quick Command (sanity grep)

```bash
grep -rn "SECURITY_DISABLED" server/
```

Should list:
- `server/config/securityFlag.js` (the constant declaration)
- one `require` line in each consumer
- one branch per gated feature

If you re-enable but `grep` still finds branches that should run regardless — that's expected, the branches stay; they just become "always take the secure path" when the flag is `false`.

---

## One-Time Cleanup Path (Permanent)

If you want to permanently delete the kill-switch instead of just flipping it:

1. Set `SECURITY_DISABLED = false`.
2. Run `grep -rn "SECURITY_DISABLED" server/` and:
   - In each consumer file, delete the `require('./config/securityFlag')` line.
   - Replace each `if (!SECURITY_DISABLED) { ... }` block with just its body.
   - Replace each `if (SECURITY_DISABLED) return next();` line with deletion.
   - Replace `EFFECTIVE_MIN_PASSWORD_LENGTH` with `MIN_PASSWORD_LENGTH` in `server/models/User.js` and delete the temporary constant.
   - Restore the original strict CORS block in `server/server.js` (remove the `if (SECURITY_DISABLED) {...} else {...}` wrapper, keep only the `else` body).
3. Delete `server/config/securityFlag.js`.
4. Delete this file.
5. Restart and run the verification checklist above.
