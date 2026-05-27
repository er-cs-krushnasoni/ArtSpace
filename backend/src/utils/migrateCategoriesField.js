const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const products = await Product.find({}).lean();
  let migrated = 0;

  for (const p of products) {
    const oldCats = p.categories || [];
    // Check if already in new format
    if (oldCats.length === 0 || (oldCats[0] && oldCats[0].categoryId)) {
      continue; // already migrated
    }
    const newCats = oldCats.map((id) => ({
      categoryId: id,
      selectedValues: [],
    }));
    await Product.updateOne({ _id: p._id }, { $set: { categories: newCats } });
    migrated++;
  }

  console.log(`Migrated ${migrated} products`);
  await mongoose.disconnect();
}

migrate().catch(console.error);