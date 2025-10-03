const { nanoid } = require('nanoid');
const Url = require('../models/Url');

/**
 * Generate a unique 7-character short ID
 * @returns {Promise<string>} Unique short ID
 */
async function generateShortId() {
  let shortId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate a 7-character alphanumeric ID
    shortId = nanoid(7);
    
    // Check if this ID already exists in the database
    const existingUrl = await Url.findOne({ shortId });
    if (!existingUrl) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique short ID after multiple attempts');
  }

  return shortId;
}

module.exports = {
  generateShortId
};
