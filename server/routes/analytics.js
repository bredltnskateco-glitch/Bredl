const express = require('express');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', protect, adminOnly, asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalCustomers, revenueAgg, statusAgg] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'client' }),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const recentOrders = await Order.find()
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(10);

  const lowStock = await Product.find({ stock: { $lte: 20 } })
    .sort({ stock: 1 })
    .limit(10);

  const statusCounts = statusAgg.reduce(
    (acc, s) => ({ ...acc, [s._id]: s.count }),
    { Pending: 0, Processing: 0, Shipped: 0, Completed: 0, Cancelled: 0 },
  );

  res.json({
    totalOrders,
    totalProducts,
    totalCustomers,
    totalRevenue: revenueAgg[0]?.revenue || 0,
    statusCounts,
    recentOrders,
    lowStock,
  });
}));

router.get('/sales', protect, adminOnly, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

  const series = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(series);
}));

router.get('/top-products', protect, adminOnly, asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const data = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        sold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: limit },
  ]);
  res.json(data);
}));

module.exports = router;
