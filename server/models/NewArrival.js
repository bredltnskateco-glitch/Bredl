const mongoose = require('mongoose');

const newArrivalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  hoverImage: { type: String, default: '' },
  regularPrice: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  isOnSale: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },
  sizes: [String],
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
}, { timestamps: true });

module.exports = mongoose.model('NewArrival', newArrivalSchema);
