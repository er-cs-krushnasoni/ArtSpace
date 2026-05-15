const express = require('express');
const router = express.Router();
const { refreshTokenHandler, logoutHandler } = require('../middleware/auth');

// POST /api/auth/refresh — silent token refresh via httpOnly cookie
router.post('/refresh', refreshTokenHandler);

// POST /api/auth/logout — clear refresh token from DB + cookie
router.post('/logout', logoutHandler);

module.exports = router;