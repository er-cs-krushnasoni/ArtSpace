const crypto = require('crypto');

/**
 * Generate a URL-safe slug from a string.
 * e.g. "My Blog Post Title!" → "my-blog-post-title"
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Ensure a slug is unique within a given model/tenant.
 * Appends -2, -3, etc. if needed.
 */
const ensureUniqueSlug = async (
  baseSlug,
  Model,
  tenantId,
  slugField = 'slug',
  excludeId = null
) => {
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const query = { tenantId, [slugField]: slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.findOne(query);
    if (!exists) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

/**
 * Generate a secure random token (for password reset etc.)
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a token for storage (never store raw tokens in DB).
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Reserved slugs that cannot be used by tenants.
 * Includes 's' because all tenant paths are /s/[slug] —
 * a tenant named 's' would break all routing.
 */
const RESERVED_SLUGS = new Set([
  'www', 'api', 'admin', 'app', 'mail',
  'static', 'assets', 'superadmin', 's',
]);

const isReservedSlug = (slug) => RESERVED_SLUGS.has(slug.toLowerCase());

/**
 * Convert a UTC date to IST display string.
 */
const toIST = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
};

/**
 * Calculate plan expiry date from a start date.
 */
const calculateExpiryDate = (plan, customDays = null, startFrom = new Date()) => {
  const PLAN_DAYS = {
    trial: 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '12m': 365,
  };

  let days;
  if (plan === 'custom') {
    days = customDays;
  } else {
    days = PLAN_DAYS[plan];
  }

  if (!days || days < 1) throw new Error(`Invalid plan or days: ${plan}`);

  const expiry = new Date(startFrom);
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};

module.exports = {
  generateSlug,
  ensureUniqueSlug,
  generateSecureToken,
  hashToken,
  RESERVED_SLUGS,
  isReservedSlug,
  toIST,
  calculateExpiryDate,
};