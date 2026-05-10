const express = require('express');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Create new order (authenticated user). Decrements stock atomically.
router.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingCost = 0, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const productIds = items.map((i) => i.product).filter(Boolean);
  const dbProducts = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let itemsTotal = 0;

  for (const it of items) {
    const dbProduct = productMap.get(String(it.product));
    if (!dbProduct) {
      res.status(400);
      throw new Error(`Product ${it.product} not found`);
    }
    if (dbProduct.stock < it.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${dbProduct.name}`);
    }
    const unitPrice = dbProduct.salePrice ?? dbProduct.price;
    itemsTotal += unitPrice * it.quantity;
    orderItems.push({
      product: dbProduct._id,
      name: dbProduct.name,
      image: dbProduct.image,
      price: unitPrice,
      quantity: it.quantity,
      selectedSize: it.selectedSize || null,
      selectedColor: it.selectedColor || null,
    });
  }

  // Decrement stock
  for (const it of orderItems) {
    await Product.updateOne({ _id: it.product }, { $inc: { stock: -it.quantity } });
  }

  const orderNumber = await Order.generateOrderNumber();
  const total = itemsTotal + Number(shippingCost || 0);

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
    paymentMethod: paymentMethod || 'cod',
    itemsTotal,
    shippingCost,
    total,
    notes: notes || '',
  });

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

router.put('/:id/status', protect, adminOnly, asyncHandler(async (req, res) => {
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

router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json({ message: 'Order deleted' });
}));

module.exports = router;
