const Url = require("../models/Url");

let nanoidFn; // cached after first load

async function nanoid(length = 7) {
  if (!nanoidFn) {
    const mod = await import("nanoid"); // ✅ works in CommonJS on Vercel
    nanoidFn = mod.nanoid;
  }
  return nanoidFn(length);
}

/**
 * Generate a unique 7-character short ID
 * @returns {Promise<string>} Unique short ID
 */
async function generateShortId() {
  let shortId;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    shortId = await nanoid(7); // ✅ changed here

    const existingUrl = await Url.findOne({ shortId });
    if (!existingUrl) return shortId;

    attempts++;
  }

  throw new Error("Failed to generate unique short ID after multiple attempts");
}

module.exports = { generateShortId };
