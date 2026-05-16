const mongoose = require('mongoose');

const SINGLETON_KEY = 'site-settings';

const socialsSchema = new mongoose.Schema({
  instagram: { type: String, default: 'https://www.instagram.com' },
  facebook: { type: String, default: 'https://www.facebook.com' },
  twitter: { type: String, default: 'https://twitter.com' },
  youtube: { type: String, default: 'https://www.youtube.com' },
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  text: { type: String, default: '', maxlength: 280 },
  href: { type: String, default: '', maxlength: 400 },
}, { _id: false });

const notificationsSchema = new mongoose.Schema({
  emailEnabled: { type: Boolean, default: true },
  orderEnabled: { type: Boolean, default: true },
  marketingEnabled: { type: Boolean, default: false },
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: SINGLETON_KEY },
  storeName: { type: String, default: 'BREDL', maxlength: 80 },
  storeTagline: {
    type: String,
    default: 'Your local skate shop in Barcelona since 2010. Premium skate gear, shoes, and clothing from the best brands.',
    maxlength: 280,
  },
  storeEmail: { type: String, default: '', maxlength: 254 },
  storePhone: { type: String, default: '', maxlength: 30 },
  storeAddress: { type: String, default: '', maxlength: 200 },
  currency: { type: String, default: 'TND', maxlength: 8 },
  timezone: { type: String, default: 'Europe/Madrid', maxlength: 60 },
  socials: { type: socialsSchema, default: () => ({}) },
  announcement: { type: announcementSchema, default: () => ({}) },
  notifications: { type: notificationsSchema, default: () => ({}) },
}, { timestamps: true });

settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: SINGLETON_KEY });
  if (!doc) doc = await this.create({ key: SINGLETON_KEY });
  return doc;
};

settingsSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  return {
    storeName: obj.storeName,
    storeTagline: obj.storeTagline,
    storeEmail: obj.storeEmail,
    storePhone: obj.storePhone,
    storeAddress: obj.storeAddress,
    currency: obj.currency,
    socials: obj.socials,
    announcement: obj.announcement,
  };
};

module.exports = mongoose.model('Settings', settingsSchema);
