const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  checkSlug,
  signup,
  signupCreateOrder,
  signupVerifyPayment,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/tenantAuth.controller');
const { authLimiter, signupLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

const RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'mail', 'static', 'assets', 'superadmin', 's'];
const VALID_BUSINESS_TYPES = [
  'nail_art',
  'mehendi',
  'cake',
  'makeup_artist',
  'handmade_jewellery',
  'artificial_jewellery',
  'boutique_clothing',
  'saree_boutique',
  'lehenga_boutique',
  'ethnic_wear',
  'tattoo_artist',
  'personalized_gifts',
  'wedding_decorator',
  'home_baker',
  'hair_stylist',
  'eyelash_artist',
  'bridal_stylist',
  'handmade_crafts',
  'resin_art',
  'crochet',
  'candle_brand',
  'handmade_soap',
  'handmade_skincare',
  'balloon_decoration',
  'florist',
  'event_planner',
  'chocolate_bouquet',
  'return_gifts',
  'invitation_designer',
  'custom_nameplate',
  'pottery',
  'clay_art',
  'digital_portrait',
  'home_decor',
  'wall_decor',
  'macrame',
  'furniture_decor',
  'fashion_accessories',
  'handbag_brand',
  'bridal_accessories',
  'custom_footwear',
  'watch_accessories',
  'dessert_business',
  'donut_shop',
  'macaron_business',
  'mithai_sweets',
  'gift_hamper',
  'festival_gifts',
  'rakhi_business',
  'diwali_hamper',
  'scrapbook',
  'memory_album',
  'handmade_toys',
  'pet_accessories',
  'acrylic_art',
  'handmade_stationery',
  'phone_case',
  'tumbler_mug',
  'keychain',
  'fridge_magnet',
  'wedding_favors',
  'kids_accessories',
  'baby_gifts',
  'custom_led_gifts',
  'handmade_perfume',
  'organic_beauty',
  'handmade_bags',
  'beaded_jewellery',
  'silver_jewellery',
  'bridal_jewellery_rental',
  'artificial_flower_decor',
  'festive_decor',
  'home_styling',
  'diy_craft_kits',
  'embroidery_art',
  'fabric_painting',
  'handmade_bookmarks',
  'miniature_art',
  'bottle_art',
  'handmade_frames',
  'couple_gifts',
  'anime_merchandise',
  'handmade_plushies',
  'wedding_hamper',
  'luxury_gift_box',
  'car_decor',
  'spiritual_decor',
  'puja_decor',
  'resin_gifts',
  'handmade_trinkets',
  'aesthetic_lifestyle',
  'luxury_boutique',
  'generic'
];
const VALID_PLANS_TRIAL = ['trial'];
const VALID_PLANS_PAID = ['1m', '3m', '6m', '12m', 'custom'];

const slugValidation = body('slug')
  .trim()
  .toLowerCase()
  .isLength({ min: 3, max: 30 }).withMessage('Shop URL must be 3–30 characters')
  .matches(/^[a-z0-9-]+$/).withMessage('Shop URL can only contain lowercase letters, numbers, and hyphens')
  .custom((val) => {
    if (RESERVED_SLUGS.includes(val)) throw new Error('This shop URL is reserved');
    return true;
  });

const commonSignupValidation = [
  body('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2–100 characters'),
  slugValidation,
  body('businessType').isIn(VALID_BUSINESS_TYPES).withMessage('Invalid business type'),
  body('ownerName').trim().isLength({ min: 2, max: 60 }).withMessage('Owner name must be 2–60 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').matches(/^\d{10,15}$/).withMessage('Mobile must be 10–15 digits'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

// ─── GET /api/tenantauth/check-slug ──────────────────────────────────────────
router.get('/check-slug', checkSlug);

// ─── POST /api/tenantauth/signup (trial only) ─────────────────────────────────
router.post(
  '/signup',
  signupLimiter,
  [
    ...commonSignupValidation,
    body('plan').isIn(VALID_PLANS_TRIAL).withMessage('This endpoint is for trial signup only'),
  ],
  signup
);

// ─── POST /api/tenantauth/signup-create-order (paid plans — step 1) ──────────
router.post(
  '/signup-create-order',
  signupLimiter,
  [
    ...commonSignupValidation,
    body('plan').isIn(VALID_PLANS_PAID).withMessage('Invalid paid plan selected'),
    body('customDays').optional().isInt({ min: 1 }).withMessage('Custom days must be at least 1'),
  ],
  signupCreateOrder
);

// ─── POST /api/tenantauth/signup-verify-payment (paid plans — step 2) ────────
router.post(
  '/signup-verify-payment',
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required'),
    body('pendingToken').notEmpty().withMessage('Pending token is required'),
  ],
  signupVerifyPayment
);

// ─── POST /api/tenantauth/login ───────────────────────────────────────────────
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// ─── POST /api/tenantauth/logout ──────────────────────────────────────────────
router.post('/logout', logout);

// ─── POST /api/tenantauth/forgot-password ─────────────────────────────────────
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  forgotPassword
);

// ─── POST /api/tenantauth/reset-password ──────────────────────────────────────
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('id').notEmpty().withMessage('ID is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  resetPassword
);

module.exports = router;