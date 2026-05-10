const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedSize: { type: String, default: null },
  selectedColor: { type: String, default: null },
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: String,
  street: String,
  city: String,
  postalCode: String,
  country: String,
  phone: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: { type: String, default: 'cod' },
  itemsTotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

orderSchema.statics.generateOrderNumber = async function () {
  const last = await this.findOne().sort({ createdAt: -1 }).select('orderNumber');
  let next = 1000;
  if (last && last.orderNumber) {
    const match = last.orderNumber.match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `#RM-${next}`;
};

module.exports = mongoose.model('Order', orderSchema);
