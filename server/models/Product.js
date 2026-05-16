const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, default: '' },
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  description: { type: String, default: '' },
  sku: { type: String, default: '' },

  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, default: null },

  stock: { type: Number, default: 0, min: 0 },

  image: { type: String, default: '' },
  hoverImage: { type: String, default: '' },
  images: [String],

  sizes: [String],
  shoeSize: [String],
  colors: [String],
  tags: [String],

  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isPromo: { type: Boolean, default: false },

  // Skate-specific
  deckWidth: String,
  concave: String,
  material: String,
  truckSize: String,
  axleWidth: String,
  wheelSize: String,
  durometer: String,
  wheelShape: String,
  boardLength: String,
  flex: String,

  // Surf-specific
  boardVolume: String,
  finSetup: String,
}, { timestamps: true });

productSchema.virtual('status').get(function () {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= 20) return 'Low Stock';
  return 'Active';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ isFeatured: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
