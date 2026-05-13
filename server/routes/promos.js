const express = require('express');
const asyncHandler = require('express-async-handler');
const Promo = require('../models/Promo');
const { protect, adminOnly, requireMfa } = require('../middleware/auth');

const router = express.Router();

// Public-ish: any authenticated user can validate a code against a subtotal
router.post('/validate', protect, asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const promo = await Promo.findValid(code);
  if (!promo) {
    res.status(404);
    throw new Error('Invalid or expired promo code');
  }
  const sub = Math.max(0, Number(subtotal) || 0);
  if (sub < (promo.minOrderTotal || 0)) {
    res.status(400);
    throw new Error(`Minimum order of ${promo.minOrderTotal} required for this code`);
  }
  res.json({
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discount: promo.computeDiscount(sub),
  });
}));

// Admin CRUD
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const items = await Promo.find().sort({ createdAt: -1 });
  res.json({ items });
}));

router.post('/', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await Promo.create(req.body);
  res.status(201).json(item);
}));

router.put('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await Promo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404);
    throw new Error('Promo not found');
  }
  res.json(item);
}));

router.delete('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const item = await Promo.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Promo not found');
  }
  res.json({ message: 'Deleted' });
}));

module.exports = router;
