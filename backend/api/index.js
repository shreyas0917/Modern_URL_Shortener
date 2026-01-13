// Vercel serverless entry: exports your Express app
const app = require("../server");

// Vercel will call this as a handler automatically
module.exports = app;
