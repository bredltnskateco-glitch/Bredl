const express = require('express');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Settings = require('../models/Settings');
const { protect, adminOnly, requireMfa } = require('../middleware/auth');

const router = express.Router();

const CACHE_TTL_MS = 60_000;
let publicCache = { etag: null, payload: null, expiresAt: 0 };
const invalidatePublic = () => { publicCache = { etag: null, payload: null, expiresAt: 0 }; };

const buildPublicPayload = async () => {
  const doc = await Settings.getSingleton();
  return doc.toPublicJSON();
};

// Public, ETag-cached. Drives Footer / AnnouncementBar / Header on every page load.
router.get('/public', asyncHandler(async (req, res) => {
  const now = Date.now();
  if (!publicCache.payload || now >= publicCache.expiresAt) {
    const payload = await buildPublicPayload();
    const etag = `"${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}"`;
    publicCache = { etag, payload, expiresAt: now + CACHE_TTL_MS };
  }

  res.set('Cache-Control', 'public, max-age=60');
  res.set('ETag', publicCache.etag);

  if (req.headers['if-none-match'] === publicCache.etag) {
    return res.status(304).end();
  }
  return res.json(publicCache.payload);
}));

// Admin view — full doc (includes notifications + timezone).
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const doc = await Settings.getSingleton();
  res.json(doc.toObject());
}));

// Admin write — whitelisted upsert. MFA-gated.
const WRITABLE_FIELDS = [
  'storeName', 'storeTagline', 'storeEmail', 'storePhone', 'storeAddress',
  'currency', 'timezone', 'socials', 'announcement', 'notifications',
];

router.put('/', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const update = {};
  for (const k of WRITABLE_FIELDS) {
    if (req.body[k] !== undefined) update[k] = req.body[k];
  }

  const doc = await Settings.getSingleton();
  Object.assign(doc, update);
  await doc.save();
  invalidatePublic();
  res.json(doc.toObject());
}));

module.exports = router;
