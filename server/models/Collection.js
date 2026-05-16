const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  subtitle: { type: String, default: '', maxlength: 160 },
  image: { type: String, default: '', maxlength: 600 },
  href: { type: String, default: '/shop', maxlength: 400 },
  order: { type: Number, default: 0, index: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
