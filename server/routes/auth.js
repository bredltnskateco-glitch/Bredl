const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

router.post('/register', asyncHandler(async (req, res) => {
  const {
    firstName, lastName, email, password,
    phone, street, city, postalCode, country, newsletter,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('firstName, lastName, email, and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    firstName, lastName, email, password,
    phone: phone || '',
    address: { street, city, postalCode, country },
    newsletter: !!newsletter,
  });

  res.status(201).json({
    user: user.toPublicJSON(),
    token: signToken(user),
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    user: user.toPublicJSON(),
    token: signToken(user),
  });
}));

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
}));

router.put('/me', protect, asyncHandler(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'address', 'newsletter'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  if (req.body.password) req.user.password = req.body.password;
  await req.user.save();
  res.json({ user: req.user.toPublicJSON() });
}));

module.exports = router;
