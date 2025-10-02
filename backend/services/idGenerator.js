const Counter = require('../models/Counter');

// Base62 characters for URL-safe encoding
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Convert a number to Base62 string
 * @param {number} num - The number to convert
 * @returns {string} Base62 encoded string
 */
function toBase62(num) {
  if (num === 0) return '0';
  
  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

/**
 * Generate a unique short ID using counter
 * @returns {Promise<string>} Unique short ID
 */
async function generateShortId() {
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'url_count' },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    
    return toBase62(counter.sequence_value);
  } catch (error) {
    throw new Error('Failed to generate short ID: ' + error.message);
  }
}

module.exports = {
  generateShortId,
  toBase62
};
