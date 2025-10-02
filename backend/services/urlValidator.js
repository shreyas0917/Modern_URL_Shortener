const { body, validationResult } = require('express-validator');

/**
 * Validate URL format and content
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize URL to prevent XSS and other attacks
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
function sanitizeUrl(url) {
  return url.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Check if URL is blacklisted (malicious domains, etc.)
 * @param {string} url - URL to check
 * @returns {boolean} True if blacklisted
 */
function isBlacklisted(url) {
  const blacklistedDomains = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1'
  ];
  
  try {
    const urlObj = new URL(url);
    return blacklistedDomains.includes(urlObj.hostname);
  } catch {
    return true; // Invalid URLs are considered blacklisted
  }
}

/**
 * Express validation middleware for URL shortening
 */
const urlValidationRules = [
  body('longUrl')
    .notEmpty()
    .withMessage('URL is required')
    .custom((value) => {
      if (!isValidUrl(value)) {
        throw new Error('Invalid URL format');
      }
      return true;
    })
    .custom((value) => {
      if (isBlacklisted(value)) {
        throw new Error('URL is not allowed');
      }
      return true;
    })
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  isValidUrl,
  sanitizeUrl,
  isBlacklisted,
  urlValidationRules,
  handleValidationErrors
};
