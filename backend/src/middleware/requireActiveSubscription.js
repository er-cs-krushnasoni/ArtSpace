/**
 * requireActiveSubscription
 * Blocks all tenant write routes if subscription is not active.
 * Applied AFTER authenticateTenantAdmin (so req.tenant is already populated).
 *
 * NOT applied to:
 *  - GET /api/subscription/status
 *  - POST /api/subscription/create-order
 *  - POST /api/subscription/verify-payment
 */
const requireActiveSubscription = (req, res, next) => {
  const tenant = req.tenant;

  if (!tenant) {
    return res.status(401).json({ success: false, message: 'Tenant not resolved' });
  }

  switch (tenant.status) {
    case 'active':
      return next();
    case 'expired':
      return res.status(403).json({
        success: false,
        message: 'Subscription expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED',
      });
    case 'paused':
      return res.status(403).json({
        success: false,
        message: 'Your account is temporarily paused.',
        code: 'ACCOUNT_PAUSED',
      });
    case 'inactive':
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
        code: 'ACCOUNT_INACTIVE',
      });
    case 'pending_manual':
      return res.status(403).json({
        success: false,
        message: 'Your account is pending activation.',
        code: 'PENDING_MANUAL',
      });
    default:
      return res.status(403).json({ success: false, message: 'Access denied.' });
  }
};

module.exports = requireActiveSubscription;