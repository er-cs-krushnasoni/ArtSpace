const cron = require('node-cron');
const Tenant = require('../models/Tenant');
const { deleteFromCloudinary, extractPublicId } = require('../config/cloudinary');

let Query, Task;
const loadModels = () => {
  if (!Query) Query = require('../models/Query');
  if (!Task) Task = require('../models/Task');
};

/**
 * Helper: Delete all Cloudinary assets attached to a Query document.
 */
const cleanupQueryAssets = async (query) => {
  const assetUrls = [
    ...(query.referenceImages || []),
    ...(query.descriptionImages || []),
  ];
  for (const url of assetUrls) {
    const publicId = extractPublicId(url);
    if (publicId) {
      await deleteFromCloudinary(publicId).catch((e) =>
        console.error(`Failed to delete Cloudinary asset ${publicId}:`, e.message)
      );
    }
  }
};

const cleanupTaskAssets = async (task) => {
  // Tasks don't store images directly — placeholder for future use
};

// ─── JOB 1: Expire subscriptions ─────────────────────────────────────────────
// Every hour: find active tenants whose planExpiryDate has passed
// NOTE: 'trial' is a plan value, NOT a status. Status is always 'active' during trial.
const expireSubscriptions = cron.schedule('0 * * * *', async () => {
  const now = new Date();
  console.log(`[CRON] ${now.toISOString()} — Running subscription expiry check`);
  try {
    const result = await Tenant.updateMany(
      {
        status: 'active',
        planExpiryDate: { $lt: now },
      },
      {
        $set: { status: 'expired' },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[CRON] Expired ${result.modifiedCount} tenant subscription(s)`);
    }
  } catch (error) {
    console.error('[CRON] Subscription expiry error:', error.message);
  }
});

// ─── JOB 2: Auto-delete stale queries (24hr after seenAt) ────────────────────
const deleteStaleQueries = cron.schedule('5 * * * *', async () => {
  loadModels();
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  console.log(`[CRON] ${now.toISOString()} — Running stale query cleanup`);
  try {
    const staleQueries = await Query.find({
      status: { $ne: 'reply_later' },
      seenAt: { $lt: cutoff, $ne: null },
    });
    for (const query of staleQueries) {
      await cleanupQueryAssets(query);
      await query.deleteOne();
    }
    if (staleQueries.length > 0) {
      console.log(`[CRON] Deleted ${staleQueries.length} stale query/queries`);
    }
  } catch (error) {
    console.error('[CRON] Stale query cleanup error:', error.message);
  }
});

// ─── JOB 3: Auto-delete cancelled tasks after 48hrs ───────────────────────────
const deleteCancelledTasks = cron.schedule('10 * * * *', async () => {
  loadModels();
  const now    = new Date();
  const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  console.log(`[CRON] ${now.toISOString()} — Running cancelled task cleanup`);
  try {
    const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');
    const stale = await Task.find({
      taskStatus:  'cancelled',
      cancelledAt: { $lt: cutoff, $ne: null },
    });
    for (const task of stale) {
      await AnalyticsSnapshot.deleteOne({
        taskId: new mongoose.Types.ObjectId(task._id),
        type: 'task',
      });
      await task.deleteOne();
    }
    if (stale.length > 0)
      console.log(`[CRON] Deleted ${stale.length} cancelled task(s)`);
  } catch (error) {
    console.error('[CRON] Cancelled task cleanup error:', error.message);
  }
});

// ─── JOB 4: Revert expired discounts ─────────────────────────────────────────
const revertExpiredDiscounts = cron.schedule('15 * * * *', async () => {
  const now = new Date();
  console.log(`[CRON] ${now.toISOString()} — Running discount expiry check`);
  try {
    const Product = require('../models/Product');
    const expiredDiscountProducts = await Product.find({
      'discount.isActive': true,
      'discount.endDate': { $lt: now },
    });
    for (const product of expiredDiscountProducts) {
      product.deliveryPrice = product.discount.originalDeliveryPrice;
      product.appointmentPrice = product.discount.originalAppointmentPrice;
      product.discount.isActive = false;
      await product.save();
    }
    if (expiredDiscountProducts.length > 0) {
      console.log(`[CRON] Reverted discounts on ${expiredDiscountProducts.length} product(s)`);
    }
  } catch (error) {
    console.error('[CRON] Discount revert error:', error.message);
  }
});

// ─── JOB 5: Purge expired trial tenant data ───────────────────────────────────
// Every day at 2am: find expired trial tenants and delete all their data + Cloudinary assets
const purgeExpiredTrials = cron.schedule('0 2 * * *', async () => {
  const now = new Date();
  console.log(`[CRON] ${now.toISOString()} — Running expired trial purge`);
  try {
    const Product = require('../models/Product');
    const expiredTrials = await Tenant.find({
      status: 'expired',
      plan: 'trial',
    });

    for (const tenant of expiredTrials) {
      const tenantId = tenant._id;

      // Delete all products + their Cloudinary images
      const products = await Product.find({ tenantId });
      for (const product of products) {
        for (const photoUrl of product.photos || []) {
          const publicId = extractPublicId(photoUrl);
          if (publicId) {
            await deleteFromCloudinary(publicId).catch((e) =>
              console.error(`Cloudinary delete failed for ${publicId}:`, e.message)
            );
          }
        }
        await product.deleteOne();
      }

      // Delete tenant logo + pwa icon from Cloudinary
      if (tenant.websiteConfig?.logoPublicId) {
        await deleteFromCloudinary(tenant.websiteConfig.logoPublicId).catch(() => {});
      }
      if (tenant.websiteConfig?.pwaIconPublicId) {
        await deleteFromCloudinary(tenant.websiteConfig.pwaIconPublicId).catch(() => {});
      }

      // Delete analytics snapshots for this tenant
      const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');
      await AnalyticsSnapshot.deleteMany({ tenantId });

      // Delete the tenant itself
      // NOTE: TrialBlacklist entry for this mobile is intentionally NOT deleted
      await tenant.deleteOne();
      console.log(`[CRON] Purged expired trial tenant: ${tenant.slug}`);
    }
  } catch (error) {
    console.error('[CRON] Trial purge error:', error.message);
  }
});

// ─── JOB 6: Auto-delete completed tasks after 7 days ─────────────────────────
const deleteCompletedTasks = cron.schedule('20 * * * *', async () => {
  loadModels();
  const now    = new Date();
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  console.log(`[CRON] ${now.toISOString()} — Running completed task cleanup`);
  try {
    const stale = await Task.find({
      taskStatus:  'completed',
      completedAt: { $lt: cutoff, $ne: null },
    });
    for (const task of stale) {
      await task.deleteOne();
    }
    if (stale.length > 0)
      console.log(`[CRON] Deleted ${stale.length} completed task(s)`);
  } catch (error) {
    console.error('[CRON] Completed task cleanup error:', error.message);
  }
});

const startAllCronJobs = () => {
  console.log('⏰ Cron jobs initialized:');
  console.log('   • [0 * * * *]  Subscription expiry check');
  console.log('   • [5 * * * *]  Stale query cleanup (24hr after seen)');
  console.log('   • [10 * * * *] Cancelled task cleanup (48hr)');
  console.log('   • [15 * * * *] Expired discount revert');
  console.log('   • [20 * * * *] Completed task cleanup (7 days)');
  console.log('   • [0 2 * * *]  Expired trial data purge');
};

module.exports = {
  startAllCronJobs,
  expireSubscriptions,
  deleteStaleQueries,
  deleteCancelledTasks,
  revertExpiredDiscounts,
  deleteCompletedTasks,
  purgeExpiredTrials,
};