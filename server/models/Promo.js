const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 40,
  },
  description: { type: String, default: '', maxlength: 200 },
  discountType: { type: String, enum: ['percent', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderTotal: { type: Number, default: 0, min: 0 },
  maxUses: { type: Number, default: null, min: 0 },
  usedCount: { type: Number, default: 0, min: 0 },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

promoSchema.statics.findValid = async function (code) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return null;
  const promo = await this.findOne({ code: normalized });
  if (!promo || !promo.isActive) return null;
  if (promo.expiresAt && promo.expiresAt.getTime() <= Date.now()) return null;
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return null;
  return promo;
};

promoSchema.methods.computeDiscount = function (subtotal) {
  const sub = Math.max(0, Number(subtotal) || 0);
  if (sub < (this.minOrderTotal || 0)) return 0;
  const raw = this.discountType === 'percent'
    ? (sub * this.discountValue) / 100
    : this.discountValue;
  return Math.max(0, Math.min(raw, sub));
};

module.exports = mongoose.model('Promo', promoSchema);
