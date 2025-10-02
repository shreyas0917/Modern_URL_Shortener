const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  redirectUrl
} = require('../controllers/urlController');
const { urlValidationRules, handleValidationErrors } = require('../services/urlValidator');

// Shorten URL
router.post('/shorten', urlValidationRules, handleValidationErrors, shortenUrl);

// Redirect route (this will be handled by the main app)
router.get('/:shortId', redirectUrl);

module.exports = router;
