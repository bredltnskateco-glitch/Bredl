const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { SECURITY_DISABLED } = require('../config/securityFlag');

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 12;
const EFFECTIVE_MIN_PASSWORD_LENGTH = SECURITY_DISABLED ? 1 : MIN_PASSWORD_LENGTH;

const addressSchema = new mongoose.Schema({
  street: { type: String, maxlength: 200 },
  city: { type: String, maxlength: 100 },
  postalCode: { type: String, maxlength: 20 },
  country: { type: String, maxlength: 60 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 60 },
  lastName: { type: String, required: true, trim: true, maxlength: 60 },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
  },
  // Password is required for email/password accounts but optional for accounts
  // created via a federated provider (e.g. Google). The pre-save hook below
  // only hashes when the field is modified.
  password: {
    type: String,
    required: function () { return !this.googleId; },
    minlength: EFFECTIVE_MIN_PASSWORD_LENGTH,
    select: false,
  },
  phone: { type: String, default: '', maxlength: 30 },
  address: addressSchema,
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  newsletter: { type: Boolean, default: false },

  // Federated identity (Google Identity Services / Sign in with Google).
  // Partial filter (not sparse): sparse still indexes docs with googleId: null,
  // which would collide across all password-only users.
  googleId: {
    type: String,
    default: null,
    index: {
      unique: true,
      partialFilterExpression: { googleId: { $type: 'string' } },
    },
  },

  // Account lockout (audit item: brute force protection)
  failedLoginAttempts: { type: Number, default: 0, select: false },
  lockedUntil: { type: Date, default: null, select: false },

  // MFA / TOTP (audit item: mandatory MFA for admins)
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, default: null, select: false },
  mfaPendingSecret: { type: String, default: null, select: false },
  mfaBackupCodes: { type: [String], default: [], select: false }, // bcrypt hashes

  // Password reset (audit item: secure password reset)
  passwordResetTokenHash: { type: String, default: null, select: false },
  passwordResetExpiresAt: { type: Date, default: null, select: false },

  // Audit fields
  lastLoginAt: { type: Date, default: null },
  lastLoginIp: { type: String, default: '', select: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_COST);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockedUntil && this.lockedUntil.getTime() > Date.now());
};

userSchema.methods.registerFailedLogin = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 15 * 60 * 1000;
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  if (this.failedLoginAttempts >= MAX_ATTEMPTS) {
    this.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
    this.failedLoginAttempts = 0;
  }
  await this.save();
};

userSchema.methods.registerSuccessfulLogin = async function (ip) {
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  this.lastLoginAt = new Date();
  this.lastLoginIp = ip || '';
  await this.save();
};

userSchema.methods.consumeBackupCode = async function (code) {
  if (!Array.isArray(this.mfaBackupCodes) || this.mfaBackupCodes.length === 0) return false;
  const normalized = String(code || '').replace(/[\s-]/g, '').toLowerCase();
  for (let i = 0; i < this.mfaBackupCodes.length; i++) {
    if (await bcrypt.compare(normalized, this.mfaBackupCodes[i])) {
      this.mfaBackupCodes.splice(i, 1);
      await this.save();
      return true;
    }
  }
  return false;
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    address: this.address,
    role: this.role,
    newsletter: this.newsletter,
    mfaEnabled: this.mfaEnabled,
    createdAt: this.createdAt,
  };
};

userSchema.statics.MIN_PASSWORD_LENGTH = MIN_PASSWORD_LENGTH;

module.exports = mongoose.model('User', userSchema);
