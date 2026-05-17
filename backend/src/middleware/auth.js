const bcrypt = require('bcryptjs');
const {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/jwtUtils');
const Tenant = require('../models/Tenant');
const SuperAdmin = require('../models/SuperAdmin');

/**
 * Verifies the JWT access token from Authorization: Bearer header.
 * Attaches decoded payload to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

/**
 * Verifies token AND checks role === 'superadmin'.
 */
const authenticateSuperAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required',
      });
    }
    next();
  });
};

/**
 * Verifies token AND checks role === 'tenant_admin'.
 * Extracts tenantId from JWT only — never from request body/params.
 * Blocks access if tenant is expired, paused, inactive, or pending_manual.
 */
const authenticateTenantAdmin = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({
        success: false,
        message: 'Tenant admin access required',
      });
    }

    // If tenantResolver already resolved a tenant, ensure JWT matches
    if (req.tenant && req.tenant._id.toString() !== req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Token does not match this tenant',
      });
    }

    try {
      // Always fetch fresh from DB — tenantId from JWT only, never from request
      const tenant =
        req.tenant || (await Tenant.findById(req.user.tenantId));

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        });
      }

      if (tenant.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Contact support.',
          code: 'ACCOUNT_INACTIVE',
        });
      }

      if (tenant.status === 'pending_manual') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending activation. Please contact support.',
          code: 'PENDING_MANUAL',
        });
      }

      // expired and paused are allowed through authenticateTenantAdmin
      // so tenants can reach GET /subscription/status and payment routes.
      // requireActiveSubscription middleware blocks write routes for these statuses.
      // The frontend reads the status from GET /subscription/status and shows
      // ExpiredPage or PausedPage accordingly.

      req.tenant = tenant;
      next();
    } catch (error) {
      next(error);
    }
  });
};

/**
 * Refresh token endpoint handler.
 * POST /api/auth/refresh
 *
 * Security flow:
 * 1. Read refresh token from httpOnly cookie
 * 2. Verify JWT signature
 * 3. Look up user in DB
 * 4. Compare token against stored bcrypt hash
 * 5. Issue new access token + rotate refresh token
 */
const refreshTokenHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found',
      });
    }

    // Step 1: Verify JWT signature
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    // Step 2: Look up user in DB and verify hash
    let user;
    if (decoded.role === 'superadmin') {
      user = await SuperAdmin.findById(decoded.id).select('+refreshTokenHash');
    } else if (decoded.role === 'tenant_admin') {
      user = await Tenant.findById(decoded.id).select('+refreshTokenHash');
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token role',
      });
    }

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        message: 'Session not found. Please log in again.',
      });
    }

    // Step 3: Compare token against stored hash
    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token mismatch. Please log in again.',
      });
    }

    // Step 4: Check tenant status if tenant admin
    if (decoded.role === 'tenant_admin') {
      // inactive and pending_manual — full block, clear session
      if (['inactive', 'pending_manual'].includes(user.status)) {
        res.clearCookie('refreshToken');
        return res.status(403).json({
          success: false,
          message: 'Account access restricted. Please contact support.',
          code: `ACCOUNT_${user.status.toUpperCase()}`,
        });
      }
      // expired and paused — still issue tokens so tenant can reach
      // the subscription/payment routes to renew
      // The subscription middleware handles blocking other routes
    }

    // Step 5: Rotate refresh token — issue new pair
    const tokenPayload = {
      id: user._id,
      role: decoded.role,
      ...(decoded.role === 'tenant_admin' && {
        tenantId: user._id.toString(),
        slug: user.slug,
      }),
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Store new refresh token hash (rotation — old one invalidated)
    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 12);
    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return new access token + user data for AuthContext to restore state
    const userData = {
      id: user._id,
      role: decoded.role,
      ...(decoded.role === 'tenant_admin' && {
        tenantId: user._id.toString(),
        slug: user.slug,
        businessName: user.businessName,
        businessType: user.businessType,
      }),
      ...(decoded.role === 'superadmin' && {
        email: user.email,
      }),
    };

    res.json({
      success: true,
      accessToken: newAccessToken,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout handler — clears refresh token from DB and cookie.
 * POST /api/auth/logout
 * Works for both superadmin and tenant_admin.
 */
const logoutHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
        // Clear hash from DB
        if (decoded.role === 'superadmin') {
          await SuperAdmin.findByIdAndUpdate(decoded.id, {
            $unset: { refreshTokenHash: '' },
          });
        } else if (decoded.role === 'tenant_admin') {
          await Tenant.findByIdAndUpdate(decoded.id, {
            $unset: { refreshTokenHash: '' },
          });
        }
      } catch {
        // Token already invalid — still clear the cookie
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  authenticateSuperAdmin,
  authenticateTenantAdmin,
  refreshTokenHandler,
  logoutHandler,
};