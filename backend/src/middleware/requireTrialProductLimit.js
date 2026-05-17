const Product = require('../models/Product');

/**
 * requireTrialProductLimit
 * Applied only to POST /api/tenant/products (create product).
 * If tenant is on trial plan and already has 10+ products → block.
 */
const requireTrialProductLimit = async (req, res, next) => {
  try {
    const tenant = req.tenant;

    if (!tenant || tenant.plan !== 'trial') {
      return next(); // not on trial — no limit
    }

    const count = await Product.countDocuments({ tenantId: tenant._id });

    if (count >= 10) {
      return res.status(403).json({
        success: false,
        message:
          'Free trial allows a maximum of 10 products. Please upgrade to add more.',
        code: 'TRIAL_PRODUCT_LIMIT',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireTrialProductLimit;