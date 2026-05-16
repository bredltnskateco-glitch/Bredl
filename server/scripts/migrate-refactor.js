// One-shot data migration for the May-2026 storefront refactor.
//   1. Drop orphan deckLength/wheelbase columns from products.
//   2. Lowercase Product.category strings (e.g. "Skate" -> "skate") to align
//      with Category.slug values used by the new server-side filter.
//   3. Normalize brand "BREDL"/"bredl" -> "Bredl".
// Idempotent — safe to re-run.
//
// Usage: node server/scripts/migrate-refactor.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const run = async () => {
  await connectDB();

  console.log('migrate: unsetting deckLength + wheelbase...');
  const unset = await Product.updateMany(
    {},
    { $unset: { deckLength: '', wheelbase: '' } },
  );
  console.log(`  modified: ${unset.modifiedCount}`);

  console.log('migrate: lowercasing Product.category...');
  const lower = await Product.updateMany(
    {},
    [{ $set: { category: { $toLower: '$category' } } }],
  );
  console.log(`  modified: ${lower.modifiedCount}`);

  console.log('migrate: normalizing brand BREDL/bredl -> Bredl...');
  const brand = await Product.updateMany(
    { brand: { $in: ['BREDL', 'bredl'] } },
    { $set: { brand: 'Bredl' } },
  );
  console.log(`  modified: ${brand.modifiedCount}`);

  console.log('migrate: done');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
