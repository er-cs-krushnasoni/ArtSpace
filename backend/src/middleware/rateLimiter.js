const rateLimit = require('express-rate-limit');

/**
 * Auth limiter — applied to login endpoints.
 * 5 requests per IP per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

/**
 * General limiter — applied globally to all /api/* routes.
 * 100 requests per IP per 15 minutes.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

/**
 * Signup limiter — 3 signups per IP per hour.
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many signup attempts. Please try again in an hour.',
  },
});

/**
 * Forgot password limiter — 3 requests per IP per hour.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again in an hour.',
  },
});

/**
 * Trial signup limiter — 1 free trial per IP per 24 hours.
 * (30-day window exceeds JS 32-bit int limit — 24hr is the practical max for MemoryStore)
 * Only enforced when plan === 'trial' inside the signup controller.
 */
const trialSignupLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours (max safe for MemoryStore)
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'A free trial has already been started from this network today. Please choose a paid plan.',
  },
});

module.exports = {
  authLimiter,
  generalLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  trialSignupLimiter,
};