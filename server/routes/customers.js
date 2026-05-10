const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = { role: 'client' };
  if (search) {
    const re = new RegExp(search, 'i');
    filter.$or = [
      { firstName: re }, { lastName: re }, { email: re },
    ];
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

  const stats = await Order.aggregate([
    { $match: { user: { $in: users.map((u) => u._id) } } },
    {
      $group: {
        _id: '$user',
        orders: { $sum: 1 },
        spent: { $sum: '$total' },
      },
    },
  ]);
  const statMap = new Map(stats.map((s) => [String(s._id), s]));

  const enriched = users.map((u) => ({
    id: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    phone: u.phone,
    location: [u.address?.city, u.address?.country].filter(Boolean).join(', '),
    address: u.address,
    orders: statMap.get(String(u._id))?.orders || 0,
    spent: statMap.get(String(u._id))?.spent || 0,
    joined: u.createdAt,
  }));

  res.json(enriched);
}));

router.get('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('Customer not found');
  }
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
  res.json({ user, orders });
}));

module.exports = router;
