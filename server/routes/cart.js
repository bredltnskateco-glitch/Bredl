const express = require('express');
const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const sameItem = (a, b) =>
  String(a.product) === String(b.product) &&
  (a.selectedSize || null) === (b.selectedSize || null) &&
  (a.selectedColor || null) === (b.selectedColor || null);

router.get('/', protect, asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json(cart);
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { productId, selectedSize = null, selectedColor = null, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const cart = await getOrCreateCart(req.user._id);
  const newItem = {
    product: product._id,
    name: product.name,
    image: product.image,
    price: product.salePrice ?? product.price,
    salePrice: product.salePrice,
    regularPrice: product.price,
    selectedSize,
    selectedColor,
    quantity: Math.max(1, Number(quantity)),
    addedAt: new Date(),
  };

  const existing = cart.items.find((i) => sameItem(i, newItem));
  if (existing) {
    existing.quantity += newItem.quantity;
  } else {
    cart.items.push(newItem);
  }

  await cart.save();
  res.status(201).json(cart);
}));

router.put('/item', protect, asyncHandler(async (req, res) => {
  const { productId, selectedSize = null, selectedColor = null, quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const target = { product: productId, selectedSize, selectedColor };

  if (Number(quantity) < 1) {
    cart.items = cart.items.filter((i) => !sameItem(i, target));
  } else {
    const existing = cart.items.find((i) => sameItem(i, target));
    if (!existing) {
      res.status(404);
      throw new Error('Cart item not found');
    }
    existing.quantity = Number(quantity);
  }

  await cart.save();
  res.json(cart);
}));

router.delete('/item', protect, asyncHandler(async (req, res) => {
  const { productId, selectedSize = null, selectedColor = null } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter(
    (i) => !sameItem(i, { product: productId, selectedSize, selectedColor }),
  );
  await cart.save();
  res.json(cart);
}));

router.delete('/', protect, asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json(cart);
}));

// Merge a guest (localStorage) cart into the server cart after login
router.post('/merge', protect, asyncHandler(async (req, res) => {
  const guestItems = Array.isArray(req.body.items) ? req.body.items : [];
  if (guestItems.length === 0) {
    return res.json(await getOrCreateCart(req.user._id));
  }

  const productIds = guestItems.map((i) => i.product || i.id).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } });
  const map = new Map(products.map((p) => [p._id.toString(), p]));

  const cart = await getOrCreateCart(req.user._id);
  for (const it of guestItems) {
    const pid = String(it.product || it.id);
    const p = map.get(pid);
    if (!p) continue;
    const candidate = {
      product: p._id,
      name: p.name,
      image: p.image,
      price: p.salePrice ?? p.price,
      salePrice: p.salePrice,
      regularPrice: p.price,
      selectedSize: it.selectedSize || null,
      selectedColor: it.selectedColor || null,
      quantity: Math.max(1, Number(it.quantity) || 1),
      addedAt: new Date(),
    };
    const existing = cart.items.find((i) => sameItem(i, candidate));
    if (existing) {
      existing.quantity += candidate.quantity;
    } else {
      cart.items.push(candidate);
    }
  }
  await cart.save();
  res.json(cart);
}));

module.exports = router;
