const Url = require('../models/Url');
const { generateShortId } = require('../services/idGenerator');
const { sanitizeUrl } = require('../services/urlValidator');
const cacheService = require('../services/cacheService');

/**
 * Shorten a URL
 * POST /api/v1/data/shorten
 */
const shortenUrl = async (req, res) => {
  try {
    const { longUrl } = req.body;
    
    // Sanitize the URL
    const sanitizedUrl = sanitizeUrl(longUrl);
    
    // Check if URL already exists
    const existingUrl = await Url.findOne({ longUrl: sanitizedUrl });
    if (existingUrl) {
      return res.json({
        success: true,
        data: {
          shortUrl: `${process.env.BASE_URL}/${existingUrl.shortId}`,
          originalUrl: existingUrl.longUrl,
          hits: existingUrl.hits,
          createdAt: existingUrl.createdAt
        }
      });
    }
    
    // Generate short ID
    const shortId = await generateShortId();
    
    // Create new URL record
    const newUrl = new Url({
      shortId,
      longUrl: sanitizedUrl,
      createdBy: req.ip // Track creator IP
    });
    
    await newUrl.save();
    
    // Cache the new URL for fast future lookups
    await cacheService.cacheUrl(newUrl);
    
    res.status(201).json({
      success: true,
      data: {
        shortUrl: `${process.env.BASE_URL}/${shortId}`,
        originalUrl: sanitizedUrl,
        hits: 0,
        createdAt: newUrl.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Redirect to original URL
 * GET /:shortId
 */
const redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    
    // Try to get URL from cache first
    const url = await cacheService.getUrl(shortId);
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found'
      });
    }
    
    // Track hit in Redis for real-time analytics
    await cacheService.trackHit(shortId);
    
    // Update hit counter in database (async, don't wait)
    url.hits += 1;
    url.save().catch(err => console.error('Error updating hits:', err));
    
    // Redirect to original URL
    res.redirect(301, url.longUrl);
    
  } catch (error) {
    console.error('Error redirecting URL:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


module.exports = {
  shortenUrl,
  redirectUrl
};
