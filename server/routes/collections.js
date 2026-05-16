const express = require('express');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Collection = require('../models/Collection');
const { protect, adminOnly, requireMfa } = require('../middleware/auth');

const router = express.Router();

const CACHE_TTL_MS = 60_000;
let cache = { etag: null, payload: null, expiresAt: 0 };
const invalidate = () => { cache = { etag: null, payload: null, expiresAt: 0 }; };

const buildList = async () => {
  const items = await Collection.find({ active: true }).sort({ order: 1, createdAt: -1 });
  return items;
};

router.get('/', asyncHandler(async (req, res) => {
  const now = Date.now();
  if (!cache.payload || now >= cache.expiresAt) {
    const payload = await buildList();
    const etag = `"${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}"`;
    cache = { etag, payload, expiresAt: now + CACHE_TTL_MS };
  }

  res.set('Cache-Control', 'public, max-age=60');
  res.set('ETag', cache.etag);

  if (req.headers['if-none-match'] === cache.etag) {
    return res.status(304).end();
  }
  return res.json(cache.payload);
}));

router.get('/all', protect, adminOnly, asyncHandler(async (req, res) => {
  const items = await Collection.find().sort({ order: 1, createdAt: -1 });
  res.json({ items });
}));

router.post('/', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await Collection.create(req.body);
  invalidate();
  res.status(201).json(item);
}));

router.put('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await Collection.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404);
    throw new Error('Collection not found');
  }
  invalidate();
  res.json(item);
}));

router.delete('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await Collection.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Collection not found');
  }
  invalidate();
  res.json({ message: 'Deleted' });
}));

module.exports = router;
