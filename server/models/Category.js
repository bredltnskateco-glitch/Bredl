const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  slug: { type: String, required: true },
  name: { type: String, required: true },
}, { _id: false });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  subcategories: [subcategorySchema],
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
