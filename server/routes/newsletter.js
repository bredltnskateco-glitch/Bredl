const express = require('express');
const asyncHandler = require('express-async-handler');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }
  const sub = await NewsletterSubscriber.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email: email.toLowerCase(), active: true },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.status(201).json({ subscribed: true, email: sub.email });
}));

router.delete('/:email', asyncHandler(async (req, res) => {
  await NewsletterSubscriber.updateOne(
    { email: req.params.email.toLowerCase() },
    { active: false },
  );
  res.json({ unsubscribed: true });
}));

router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const subs = await NewsletterSubscriber.find().sort({ createdAt: -1 });
  res.json(subs);
}));

module.exports = router;
