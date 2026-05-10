const express = require('express');
const asyncHandler = require('express-async-handler');
const News = require('../models/News');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const items = await News.find().sort({ createdAt: -1 });
  res.json(items);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const item = await News.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('News not found');
  }
  res.json(item);
}));

router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  if (req.body.featured) {
    await News.updateMany({ featured: true }, { featured: false });
  }
  const item = await News.create(req.body);
  res.status(201).json(item);
}));

router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  if (req.body.featured) {
    await News.updateMany({ _id: { $ne: req.params.id }, featured: true }, { featured: false });
  }
  const item = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) {
    res.status(404);
    throw new Error('News not found');
  }
  res.json(item);
}));

router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const item = await News.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('News not found');
  }
  res.json({ message: 'Deleted' });
}));

module.exports = router;
