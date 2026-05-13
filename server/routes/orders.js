const express = require('express');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Promo = require('../models/Promo');
const { protect, adminOnly, requireMfa } = require('../middleware/auth');

const router = express.Router();

// Create new order (authenticated user). Decrements stock atomically per-line
// using a conditional update so concurrent orders cannot oversell.
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    items, shippingAddress, paymentMethod, shippingCost = 0, notes, promoCode,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }
  if (items.length > 100) {
    res.status(400);
    throw new Error('Too many items in a single order');
  }

  // Validate shapes & coerce quantities to safe integers
  const sanitized = items.map((it) => {
    const qty = Math.floor(Number(it.quantity));
    if (!it.product || !Number.isFinite(qty) || qty < 1 || qty > 999) {
      const err = new Error('Invalid item in cart');
      err.statusCode = 400;
      throw err;
    }
    return {
      product: it.product,
      quantity: qty,
      selectedSize: it.selectedSize ? String(it.selectedSize).slice(0, 20) : null,
      selectedColor: it.selectedColor ? String(it.selectedColor).slice(0, 30) : null,
    };
  });

  const allowedPayments = new Set(['cod', 'card', 'transfer']);
  const finalPayment = allowedPayments.has(paymentMethod) ? paymentMethod : 'cod';

  // Prices come from the DB only — never trust client totals.
  const productIds = sanitized.map((i) => i.product);
  const dbProducts = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let itemsTotal = 0;

  for (const it of sanitized) {
    const dbProduct = productMap.get(String(it.product));
    if (!dbProduct) {
      res.status(400);
      throw new Error('One of the products is no longer available');
    }
    const unitPrice = dbProduct.salePrice ?? dbProduct.price;
    itemsTotal += unitPrice * it.quantity;
    orderItems.push({
      product: dbProduct._id,
      name: dbProduct.name,
      image: dbProduct.image,
      price: unitPrice,
      quantity: it.quantity,
      selectedSize: it.selectedSize,
      selectedColor: it.selectedColor,
    });
  }

  // Atomic, conditional stock decrement. If any line cannot satisfy stock,
  // roll back the previous decrements to keep inventory consistent.
  const decremented = [];
  for (const it of orderItems) {
    const result = await Product.updateOne(
      { _id: it.product, stock: { $gte: it.quantity } },
      { $inc: { stock: -it.quantity } },
    );
    if (result.modifiedCount === 0) {
      // Roll back previous successful decrements
      for (const done of decremented) {
        await Product.updateOne({ _id: done.product }, { $inc: { stock: done.quantity } });
      }
      res.status(409);
      throw new Error(`Insufficient stock for ${it.name}`);
    }
    decremented.push(it);
  }

  // Cap shipping cost to a sane range (server is the source of truth)
  const safeShippingCost = Math.max(0, Math.min(Number(shippingCost) || 0, 10000));

  // Promo: validate server-side. Never trust a client-supplied discount.
  let discount = 0;
  let appliedPromoCode = '';
  let appliedPromoId = null;
  if (promoCode) {
    const promo = await Promo.findValid(promoCode);
    if (promo) {
      const candidate = promo.computeDiscount(itemsTotal);
      if (candidate > 0) {
        discount = candidate;
        appliedPromoCode = promo.code;
        appliedPromoId = promo._id;
      }
    }
  }

  const orderNumber = await Order.generateOrderNumber();
  const total = Math.max(0, itemsTotal - discount + safeShippingCost);

  const order = await Order.create({
    orderNumber,
    user: req.user._id,
    items: orderItems,
    shippingAddress: shippingAddress || {
      fullName: `${req.user.firstName} ${req.user.lastName}`,
      street: req.user.address?.street,
      city: req.user.address?.city,
      postalCode: req.user.address?.postalCode,
      country: req.user.address?.country,
      phone: req.user.phone,
    },
    paymentMethod: finalPayment,
    itemsTotal,
    shippingCost: safeShippingCost,
    promoCode: appliedPromoCode,
    discount,
    total,
    notes: typeof notes === 'string' ? notes.slice(0, 1000) : '',
  });

  // Atomically increment promo usage only after the order is persisted.
  if (appliedPromoId) {
    await Promo.updateOne({ _id: appliedPromoId }, { $inc: { usedCount: 1 } });
  }

  // Clear cart after checkout
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json(order);
}));

// Authenticated user's orders
router.get('/mine', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}));

// Admin: list all orders
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { status, search, limit = 100, page = 1 } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (search) filter.orderNumber = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Order.find(filter).populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}));

router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email phone');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json(order);
}));

router.put('/:id/status', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.status = status;
  await order.save();
  res.json(order);
}));

router.delete('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
    console.log('Attempted to delete non-existent order with id:', req.params.id);
  }
  res.json({ message: 'Order deleted' });
}));

module.exports = router;
