const express = require('express');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, adminOnly, requireMfa } = require('../middleware/auth');

const router = express.Router();

const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const CACHE_TTL_MS = 60_000;
let listCache = { etag: null, payload: null, expiresAt: 0 };
const invalidateList = () => { listCache = { etag: null, payload: null, expiresAt: 0 }; };

const buildEnrichedList = async () => {
  const categories = await Category.find().sort({ name: 1 });

  const counts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

  const slugsNeedingFallback = categories
    .filter((c) => !c.image)
    .map((c) => c.slug);

  const fallbackImages = {};
  if (slugsNeedingFallback.length) {
    // One newest product image per category — bounded result set, uses the
    // { category: 1, createdAt: -1 } compound index instead of scanning every
    // product in those categories.
    const picks = await Product.aggregate([
      { $match: { category: { $in: slugsNeedingFallback }, image: { $nin: [null, ''] } } },
      { $sort: { category: 1, createdAt: -1 } },
      { $group: { _id: '$category', image: { $first: '$image' } } },
    ]);
    for (const p of picks) fallbackImages[p._id] = p.image;
  }

  return categories.map((cat) => {
    const obj = cat.toObject();
    return {
      ...obj,
      productCount: countMap[cat.slug] || 0,
      coverImage: obj.image || fallbackImages[cat.slug] || '',
    };
  });
};

router.get('/', asyncHandler(async (req, res) => {
  const now = Date.now();
  if (!listCache.payload || now >= listCache.expiresAt) {
    const payload = await buildEnrichedList();
    const etag = `"${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}"`;
    listCache = { etag, payload, expiresAt: now + CACHE_TTL_MS };
  }

  res.set('Cache-Control', 'public, max-age=60');
  res.set('ETag', listCache.etag);

  if (req.headers['if-none-match'] === listCache.etag) {
    return res.status(304).end();
  }
  return res.json(listCache.payload);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
}));

router.post('/', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const { name, description, image, subcategories } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  const category = await Category.create({
    name,
    slug: slugify(name),
    description: description || '',
    image: image || '',
    subcategories: subcategories || [],
  });
  invalidateList();
  res.status(201).json(category);
}));

router.put('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.name) update.slug = slugify(update.name);
  const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  invalidateList();
  res.json(category);
}));

router.delete('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  invalidateList();
  res.json({ message: 'Category deleted' });
}));

module.exports = router;
