const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const SuperAdmin = require('../models/SuperAdmin');
const Tenant = require('../models/Tenant');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');

/**
 * POST /api/superadmin/auth/login
 * Validates credentials, issues JWT pair.
 * Refresh token stored as bcrypt hash in DB + httpOnly cookie.
 */
const login = async (req, res) => {
  // 1. Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  // 2. Find super admin — always select passwordHash for comparison
  const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase().trim() })
    .select('+passwordHash +refreshTokenHash');

  // 3. Generic error — never reveal which field is wrong
  if (!superAdmin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, superAdmin.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // 4. Generate tokens — no tenantId in super admin payload
  const tokenPayload = { id: superAdmin._id, role: 'superadmin' };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 5. Hash refresh token and store in DB (never store raw token)
  superAdmin.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await superAdmin.save();

  // 6. Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

  // 7. Return access token + safe user data
  return res.json({
    success: true,
    accessToken,
    user: {
      id: superAdmin._id,
      email: superAdmin.email,
      role: 'superadmin',
    },
  });
};

/**
 * POST /api/superadmin/auth/logout
 * Clears refresh token hash from DB and cookie.
 */
const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      // Find super admin with this token and clear it
      const { verifyRefreshToken } = require('../utils/jwtUtils');
      const decoded = verifyRefreshToken(refreshToken);

      if (decoded.role === 'superadmin') {
        await SuperAdmin.findByIdAndUpdate(decoded.id, {
          $unset: { refreshTokenHash: '' },
        });
      }
    } catch {
      // Token already invalid — still clear the cookie below
    }
  }

  res.clearCookie('refreshToken', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
});

  return res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * GET /api/superadmin/auth/me
 * Returns current super admin info. Protected by authenticateSuperAdmin.
 */
const getMe = async (req, res) => {
  const superAdmin = await SuperAdmin.findById(req.user.id);

  if (!superAdmin) {
    return res.status(404).json({
      success: false,
      message: 'Super admin not found',
    });
  }

  return res.json({
    success: true,
    user: {
      id: superAdmin._id,
      email: superAdmin.email,
      role: 'superadmin',
    },
  });
};

/**
 * GET /api/superadmin/stats
 * Returns tenant counts + last 5 tenants. Protected by authenticateSuperAdmin.
 */
const getStats = async (req, res) => {
  const [totalTenants, activeTenants, trialTenants, expiredTenants, recentTenants] =
    await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ status: 'active' }),
      Tenant.countDocuments({ plan: 'trial', status: 'active' }),
      Tenant.countDocuments({ status: 'expired' }),
      Tenant.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('businessName slug plan status planExpiryDate createdAt'),
    ]);

  return res.json({
    success: true,
    totalTenants,
    activeTenants,
    trialTenants,
    expiredTenants,
    recentTenants,
  });
};

/**
 * PATCH /api/superadmin/auth/credentials
 * Super admin updates their own email and/or password.
 * Requires current password for confirmation.
 */
const updateOwnCredentials = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { currentPassword, newEmail, newPassword } = req.body;
  if (!newEmail && !newPassword)
    return res.status(400).json({ success: false, message: 'Provide at least a new email or new password' });

  const superAdmin = await SuperAdmin.findById(req.user.id).select('+passwordHash');
  if (!superAdmin)
    return res.status(404).json({ success: false, message: 'Super admin not found' });

  const valid = await bcrypt.compare(currentPassword, superAdmin.passwordHash);
  if (!valid)
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });

  const oldEmail = superAdmin.email;

  if (newEmail) {
    const normalised = newEmail.toLowerCase().trim();
    if (normalised !== superAdmin.email) {
      const taken = await SuperAdmin.findOne({ email: normalised });
      if (taken) return res.status(409).json({ success: false, message: 'Email already in use' });
      superAdmin.email = normalised;
    }
  }

  if (newPassword) {
    superAdmin.passwordHash = newPassword; // pre-save hook re-hashes
  }

  await superAdmin.save();

  // Notify via email
  try {
    const { sendSuperAdminCredentialsUpdatedEmail } = require('../utils/emailUtils');
    await sendSuperAdminCredentialsUpdatedEmail({
      to: oldEmail,
      newEmail: newEmail && newEmail.toLowerCase().trim() !== oldEmail ? newEmail.toLowerCase().trim() : null,
    });
  } catch (e) {
    console.error('SA credentials email failed:', e.message);
  }

  return res.json({
    success: true,
    message: 'Credentials updated successfully',
    user: { id: superAdmin._id, email: superAdmin.email, role: 'superadmin' },
  });
};

module.exports = { login, logout, getMe, getStats, updateOwnCredentials };