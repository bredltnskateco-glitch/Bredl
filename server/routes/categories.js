const express = require('express');
const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, adminOnly, requireMfa } = require('../middleware/auth');

const router = express.Router();

const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  const counts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

  const enriched = categories.map((cat) => ({
    ...cat.toObject(),
    productCount: countMap[cat.slug] || 0,
  }));

  res.json(enriched);
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
  const { name, description, subcategories } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  const category = await Category.create({
    name,
    slug: slugify(name),
    description: description || '',
    subcategories: subcategories || [],
  });
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
  res.json(category);
}));

router.delete('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ message: 'Category deleted' });
}));

module.exports = router;
