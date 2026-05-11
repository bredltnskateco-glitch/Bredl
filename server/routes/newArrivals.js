const express = require('express');
const asyncHandler = require('express-async-handler');
const NewArrival = require('../models/NewArrival');
const { protect, adminOnly, requireMfa } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const items = await NewArrival.find().sort({ createdAt: -1 });
  res.json(items);
}));

router.post('/', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await NewArrival.create(req.body);
  res.status(201).json(item);
}));

router.put('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await NewArrival.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  res.json(item);
}));

router.delete('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await NewArrival.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  res.json({ message: 'Deleted' });
}));

module.exports = router;
