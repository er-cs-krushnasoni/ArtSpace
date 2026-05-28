const express = require('express');
const router = express.Router();
const { authenticateTenantAdmin } = require('../middleware/auth');
const requireActiveSubscription = require('../middleware/requireActiveSubscription');
const {
  getSettings,
  updateGeneral,
  updateToggles,
  getUploadSignature,
  updateLogo,
  updateTutorialVideo,
  updateSlug,
  checkSlugAvailability,
  getSliders,
  createSlider,
  reorderSliders,
  updateSlider,
  deleteSlider,
    updateEmail,   
  updatePassword, 
} = require('../controllers/tenantConfig.controller');

// All settings routes require tenant admin auth + active subscription
router.use(authenticateTenantAdmin, requireActiveSubscription);

// General settings
router.get('/', getSettings);
router.put('/general', updateGeneral);
router.put('/toggles', updateToggles);

// Credentials
router.put('/email', updateEmail);
router.put('/password', updatePassword);

// Cloudinary upload signature
router.post('/upload-signature', getUploadSignature);

// Asset updates
router.put('/logo', updateLogo);
router.put('/tutorial-video', updateTutorialVideo);

// Slug
router.get('/slug/check', checkSlugAvailability);
router.put('/slug', updateSlug);

// Sliders — reorder must be before /:sliderId to avoid route conflict
router.get('/sliders', getSliders);
router.post('/sliders', createSlider);
router.put('/sliders/reorder', reorderSliders);
router.put('/sliders/:sliderId', updateSlider);
router.delete('/sliders/:sliderId', deleteSlider);

module.exports = router;