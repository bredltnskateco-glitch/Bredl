const express = require('express');
const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getOrCreate = async (userId) => {
  let w = await Wishlist.findOne({ user: userId });
  if (!w) w = await Wishlist.create({ user: userId, items: [] });
  return w;
};

router.get('/', protect, asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  res.json(wishlist);
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const wishlist = await getOrCreate(req.user._id);
  if (!wishlist.items.find((i) => String(i.product) === String(product._id))) {
    wishlist.items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.salePrice ?? product.price,
      addedAt: new Date(),
    });
    await wishlist.save();
  }
  res.json(wishlist);
}));

router.delete('/:productId', protect, asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  wishlist.items = wishlist.items.filter((i) => String(i.product) !== String(req.params.productId));
  await wishlist.save();
  res.json(wishlist);
}));

router.delete('/', protect, asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  wishlist.items = [];
  await wishlist.save();
  res.json(wishlist);
}));

router.post('/merge', protect, asyncHandler(async (req, res) => {
  const guestItems = Array.isArray(req.body.items) ? req.body.items : [];
  if (guestItems.length === 0) return res.json(await getOrCreate(req.user._id));

  const ids = guestItems.map((i) => i.product || i.id).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids } });
  const wishlist = await getOrCreate(req.user._id);
  const existing = new Set(wishlist.items.map((i) => String(i.product)));
  for (const p of products) {
    if (existing.has(String(p._id))) continue;
    wishlist.items.push({
      product: p._id,
      name: p.name,
      image: p.image,
      price: p.salePrice ?? p.price,
      addedAt: new Date(),
    });
  }
  await wishlist.save();
  res.json(wishlist);
}));

module.exports = router;
