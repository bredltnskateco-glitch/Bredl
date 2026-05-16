require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const NewArrival = require('./models/NewArrival');
const News = require('./models/News');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const NewsletterSubscriber = require('./models/NewsletterSubscriber');
const Promo = require('./models/Promo');
const Brand = require('./models/Brand');
const Collection = require('./models/Collection');
const Settings = require('./models/Settings');

const categories = [
  {
    name: 'Skateboard',
    slug: 'skate',
    description: 'Boards, trucks, wheels and more',
    subcategories: [
      { slug: 'complete', name: 'Complete Skateboards' },
      { slug: 'decks', name: 'Decks' },
      { slug: 'trucks', name: 'Trucks' },
      { slug: 'wheels', name: 'Wheels' },
      { slug: 'bearings', name: 'Bearings' },
      { slug: 'griptape', name: 'Griptape' },
    ],
  },
  {
    name: 'Streetwear',
    slug: 'streetwear',
    description: 'Tees, hoodies, jackets',
    subcategories: [
      { slug: 'tshirts', name: 'T-Shirts' },
      { slug: 'hoodies', name: 'Hoodies & Pullovers' },
      { slug: 'jackets', name: 'Jackets & Coats' },
      { slug: 'pants', name: 'Pants & Jeans' },
    ],
  },
  {
    name: 'Shoes',
    slug: 'shoes',
    description: 'Sneakers and skate shoes',
    subcategories: [
      { slug: 'skate-shoes', name: 'Skate Shoes' },
      { slug: 'sneakers', name: 'Sneakers' },
    ],
  },
  {
    name: 'Surf',
    slug: 'surf',
    description: 'Boards and surf gear',
    subcategories: [
      { slug: 'surfboards', name: 'Surfboards' },
      { slug: 'fins', name: 'Fins' },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Caps, bags, sunglasses',
    subcategories: [
      { slug: 'caps', name: 'Caps & Hats' },
      { slug: 'bags', name: 'Bags & Backpacks' },
    ],
  },
];

const products = [
  {
    name: 'BREDL SPORTECH TRACKSUIT JACKET BLACK',
    brand: 'Bredl',
    category: 'streetwear',
    subcategory: 'jackets',
    description: 'Lightweight tracksuit jacket with technical fabric.',
    price: 139.0,
    salePrice: 125.1,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=900&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=900&fit=crop&sat=-100',
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: true,
    isFeatured: true,
  },
  {
    name: 'NIKE SB DUNK LOW PRO',
    brand: 'Nike SB',
    category: 'shoes',
    subcategory: 'skate-shoes',
    description: 'Iconic skate sneaker with reinforced toe.',
    price: 119.0,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=900&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=900&fit=crop&sat=-100',
    shoeSize: ['38', '39', '40', '41', '42', '43', '44', '45'],
    isNew: true,
    isFeatured: true,
  },
  {
    name: 'HOCKEY SKATEBOARDS DECK 8.25"',
    brand: 'Hockey',
    category: 'skate',
    subcategory: 'decks',
    description: '7-ply maple deck with medium concave.',
    price: 85.0,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&h=900&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&h=900&fit=crop&sat=-100',
    deckWidth: '8.25"',
    concave: 'Medium',
    material: '7-Ply Maple',
    isNew: true,
  },
  {
    name: 'BREDL SPORTECH TRACKSUIT PANTS GREY',
    brand: 'Bredl',
    category: 'streetwear',
    subcategory: 'pants',
    description: 'Tapered tracksuit pants with elastic waist.',
    price: 99.0,
    salePrice: 89.1,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=900&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=900&fit=crop&sat=-100',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    name: "CHANNEL ISLANDS SURFBOARD 6'2\"",
    brand: 'Channel Islands',
    category: 'surf',
    subcategory: 'surfboards',
    description: 'High performance shortboard for everyday waves.',
    price: 750.0,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=900&fit=crop',
    boardLength: "6'2\"",
    boardVolume: '32.5L',
    finSetup: 'Thruster',
    isNew: true,
  },
  {
    name: 'SPITFIRE FORMULA FOUR 54MM',
    brand: 'Spitfire',
    category: 'skate',
    subcategory: 'wheels',
    description: 'Classic conical wheel, 99a durometer.',
    price: 42.0,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=900&fit=crop',
    wheelSize: '54mm',
    durometer: '99a',
    wheelShape: 'Conical',
    isNew: true,
  },
  {
    name: 'PALACE TRI-FERG TEE WHITE',
    brand: 'Palace',
    category: 'streetwear',
    subcategory: 'tshirts',
    description: 'Heavy weight cotton tee with chest print.',
    price: 85.0,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=900&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'VANS OLD SKOOL PRO BLACK',
    brand: 'Vans',
    category: 'shoes',
    subcategory: 'skate-shoes',
    description: 'Suede & canvas skate shoe with Pop Cush insole.',
    price: 80.0,
    stock: 70,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=900&fit=crop',
    shoeSize: ['39', '40', '41', '42', '43', '44'],
    isFeatured: true,
  },
  {
    name: 'SANTA CRUZ COMPLETE 8.0"',
    brand: 'Santa Cruz',
    category: 'skate',
    subcategory: 'complete',
    description: 'Ready-to-ride complete skateboard.',
    price: 180.0,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&h=900&fit=crop',
    deckWidth: '8.0"',
  },
  {
    name: 'THRASHER FLAME LOGO TEE BLACK',
    brand: 'Thrasher',
    category: 'streetwear',
    subcategory: 'tshirts',
    description: 'Iconic flame logo tee in heavyweight cotton.',
    price: 35.0,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=900&fit=crop',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    name: 'INDEPENDENT STAGE 11 TRUCKS 149MM',
    brand: 'Independent',
    category: 'skate',
    subcategory: 'trucks',
    description: 'Forged baseplate trucks, raw silver finish.',
    price: 62.0,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1564429238909-38f12a608ec4?w=800&h=900&fit=crop',
    truckSize: '149',
    axleWidth: '8.5"',
    isNew: true,
  },
  {
    name: 'BONES REDS BEARINGS',
    brand: 'Bones',
    category: 'skate',
    subcategory: 'bearings',
    description: 'Classic Bones Reds — fast, smooth, durable.',
    price: 22.0,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1564429238909-38f12a608ec4?w=800&h=900&fit=crop',
  },
  {
    name: 'BREDL BLACK DIAMOND GRIPTAPE',
    brand: 'Bredl',
    category: 'skate',
    subcategory: 'griptape',
    description: 'Coarse 9" grip, perforated for clean application.',
    price: 12.0,
    stock: 250,
    image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&h=900&fit=crop',
    isFeatured: true,
  },
];

const newsItems = [
  {
    title: 'Brayan Albarenga: Thunder Trucks',
    date: 'December 17, 2025',
    image: 'https://images.unsplash.com/photo-1564429238909-38f12a608ec4?w=1200&h=700&fit=crop',
    link: '#news-1',
    body: 'Brayan joins the Thunder Trucks family with a heavy edit dropping next week.',
    featured: true,
  },
  {
    title: 'New Palace Drop This Friday',
    date: 'December 10, 2025',
    image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=900&h=600&fit=crop',
    link: '#news-2',
    body: 'A fresh Palace capsule lands in store and online this Friday at 10am.',
  },
  {
    title: 'Nike SB x BREDL Collaboration',
    date: 'December 5, 2025',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&h=600&fit=crop',
    link: '#news-3',
    body: 'Limited collaboration between Nike SB and our in-house Bredl line.',
  },
];

const brands = [
  { name: 'Bredl', featured: true, order: 1 },
  { name: 'Nike SB', featured: true, order: 2 },
  { name: 'Vans', featured: true, order: 3 },
  { name: 'Palace', featured: true, order: 4 },
  { name: 'Spitfire', featured: true, order: 5 },
  { name: 'Independent', featured: true, order: 6 },
  { name: 'Bones', featured: true, order: 7 },
];

const collections = [
  {
    title: 'Skate Essentials',
    subtitle: 'Decks, trucks, wheels and bearings ready for street sessions.',
    image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=1200&h=800&fit=crop',
    href: '/shop/skate',
    order: 1,
    active: true,
  },
  {
    title: 'Fresh Streetwear',
    subtitle: 'Graphic tees, hoodies and technical layers from the latest drops.',
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1200&h=800&fit=crop',
    href: '/shop/streetwear',
    order: 2,
    active: true,
  },
  {
    title: 'Skate Shoes',
    subtitle: 'Durable silhouettes from Nike SB, Vans and more.',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&h=800&fit=crop',
    href: '/shop/shoes',
    order: 3,
    active: true,
  },
];

const promos = [
  {
    code: 'BREDL10',
    description: 'Welcome discount for local shoppers',
    discountType: 'percent',
    discountValue: 10,
    minOrderTotal: 100,
    maxUses: 500,
    isActive: true,
  },
  {
    code: 'FREESHIP',
    description: 'Fixed amount shipping credit',
    discountType: 'fixed',
    discountValue: 15,
    minOrderTotal: 150,
    maxUses: null,
    isActive: true,
  },
];

const settings = {
  storeName: 'BREDL',
  storeTagline: 'Your local skate shop in Barcelona since 2010. Premium skate gear, shoes, and clothing from the best brands.',
  storeEmail: 'hello@bredl.test',
  storePhone: '+216 00 000 000',
  storeAddress: 'Barcelona, Spain',
  currency: 'TND',
  timezone: 'Africa/Tunis',
  socials: {
    instagram: 'https://www.instagram.com',
    facebook: 'https://www.facebook.com',
    twitter: 'https://twitter.com',
    youtube: 'https://www.youtube.com',
  },
  announcement: {
    enabled: true,
    text: 'Use code BREDL10 for 10% off orders over 100 TND.',
    href: '/shop',
  },
  notifications: {
    emailEnabled: true,
    orderEnabled: true,
    marketingEnabled: false,
  },
};

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    NewArrival.deleteMany({}),
    News.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    NewsletterSubscriber.deleteMany({}),
    Promo.deleteMany({}),
    Brand.deleteMany({}),
    Collection.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  console.log('Seeding users...');
  // Demo passwords meet the production policy (≥12 chars, mixed case, digit, symbol).
  // Rotate these immediately after first login.
  await User.create([
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@rufusmacba.com',
      password: 'Admin#Demo2026',
      role: 'admin',
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'client@test.com',
      password: 'Client#Demo2026',
      role: 'client',
      phone: '+1 555 123 4567',
      address: { street: '123 Main St', city: 'Lisbon', postalCode: '1000-001', country: 'PT' },
    },
  ]);

  console.log('Seeding categories...');
  await Category.create(categories);

  console.log('Seeding products...');
  const createdProducts = await Product.create(products);

  console.log('Seeding new arrivals...');
  const featured = createdProducts.filter((p) => p.isNew).slice(0, 6);
  await NewArrival.create(featured.map((p) => ({
    name: p.name,
    category: p.category,
    image: p.image,
    hoverImage: p.hoverImage,
    regularPrice: p.price,
    salePrice: p.salePrice,
    isOnSale: !!p.salePrice,
    isNew: true,
    sizes: p.sizes && p.sizes.length ? p.sizes : p.shoeSize,
    product: p._id,
  })));

  console.log('Seeding news...');
  await News.create(newsItems);

  console.log('Seeding brands, collections, promos, and settings...');
  await Promise.all([
    Brand.create(brands),
    Collection.create(collections),
    Promo.create(promos),
  ]);
  const settingsDoc = await Settings.getSingleton();
  Object.assign(settingsDoc, settings);
  await settingsDoc.save();

  console.log('Done. Admin: admin@rufusmacba.com / Admin#Demo2026');
  console.log('       Client: client@test.com / Client#Demo2026');
  console.log('Rotate these passwords before any non-local use.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
