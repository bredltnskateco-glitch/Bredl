const express = require('express');
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { protect, adminOnly, requireMfa } = require('../middleware/auth');
const { KNOWN_SPEC_FIELDS } = require('../config/subcategorySpecs');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const {
    category, subcategory, brand, search, minPrice, maxPrice,
    onSale, isNew, isFeatured, isPromo, sort, limit = 100, page = 1,
    specs,
  } = req.query;

  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (subcategory && subcategory !== 'all') filter.subcategory = subcategory;
  if (brand && brand !== 'all' && brand !== 'All Brands') filter.brand = brand;
  if (onSale === 'true') filter.salePrice = { $ne: null };
  if (isNew === 'true') filter.isNew = true;
  if (isFeatured === 'true') filter.isFeatured = true;
  if (isPromo === 'true') filter.isPromo = true;
  if (search) filter.$text = { $search: search };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Whitelisted spec facet filters: ?specs[wheelSize]=54mm&specs[durometer]=99a
  if (specs && typeof specs === 'object') {
    for (const [field, value] of Object.entries(specs)) {
      if (!KNOWN_SPEC_FIELDS.has(field)) continue;
      if (value === undefined || value === null || value === '') continue;
      filter[field] = value;
    }
  }

  let sortOption = { createdAt: -1 };
  const ALLOWED_SORT_FIELDS = new Set(['name', 'price', 'stock', 'createdAt']);
  switch (sort) {
    case 'price-low': sortOption = { price: 1 }; break;
    case 'price-high': sortOption = { price: -1 }; break;
    case 'popular': sortOption = { isFeatured: -1, createdAt: -1 }; break;
    case 'sale': sortOption = { salePrice: -1 }; break;
    default:
      if (typeof sort === 'string' && sort.includes(':')) {
        const [field, dir] = sort.split(':');
        if (ALLOWED_SORT_FIELDS.has(field)) {
          sortOption = { [field]: dir === 'desc' ? -1 : 1 };
        }
      }
      break;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
}));

router.post('/', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}));

router.put('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
}));

router.delete('/:id', protect, adminOnly, requireMfa, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deleted' });
}));

module.exports = router;
