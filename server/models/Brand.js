const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
  logo: { type: String, default: '', maxlength: 600 },
  href: { type: String, default: '', maxlength: 400 },
  featured: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0, index: true },
}, { timestamps: true });

brandSchema.pre('save', function (next) {
  if (!this.href || this.href === '/shop') {
    const slug = String(this.name || '').toLowerCase().replace(/\s+/g, '-');
    this.href = `/shop?brand=${encodeURIComponent(slug)}`;
  }
  next();
});

module.exports = mongoose.model('Brand', brandSchema);
