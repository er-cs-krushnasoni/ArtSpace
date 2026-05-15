/**
 * Seed Script — Creates Super Admin account + default subscription pricing.
 *
 * Run once:  node src/utils/seed.js
 *
 * Uses env vars: MONGODB_URI, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const SuperAdmin = require('../models/SuperAdmin');
const SubscriptionPricing = require('../models/SubscriptionPricing');

const DEFAULT_PRICING = [
  { plan: '1m',          label: '1 Month',    price: 499,  durationDays: 30  },
  { plan: '3m',          label: '3 Months',   price: 1299, durationDays: 90  },
  { plan: '6m',          label: '6 Months',   price: 2299, durationDays: 180 },
  { plan: '12m',         label: '12 Months',  price: 3999, durationDays: 365 },
  { plan: 'custom_daily',label: 'Custom/Day', price: 20,   durationDays: null},
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Super Admin ──────────────────────────────────────────────────────────
    const existing = await SuperAdmin.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (existing) {
      console.log(`ℹ️  Super admin already exists: ${existing.email}`);
    } else {
      const superAdmin = new SuperAdmin({
        email: process.env.SUPER_ADMIN_EMAIL,
        passwordHash: process.env.SUPER_ADMIN_PASSWORD, // pre-save hook hashes this
      });
      await superAdmin.save();
      console.log(`✅ Super admin created: ${superAdmin.email}`);
    }

    // ── Subscription Pricing ─────────────────────────────────────────────────
    for (const pricing of DEFAULT_PRICING) {
      await SubscriptionPricing.findOneAndUpdate(
        { plan: pricing.plan },
        pricing,
{ upsert: true, returnDocument: 'after' }
      );
    }
    console.log('✅ Default subscription pricing seeded');

    console.log('\n🎉 Seed complete. You can now log in at /login with:');
    console.log(`   Email:    ${process.env.SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: ${process.env.SUPER_ADMIN_PASSWORD}\n`);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
