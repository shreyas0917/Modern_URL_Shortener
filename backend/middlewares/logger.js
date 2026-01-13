const fs = require("fs");
const path = require("path");

const isVercel = !!process.env.VERCEL;

// ✅ If running on Vercel serverless: do NOT create folders or write files
if (isVercel) {
  const logger = (req, res, next) => {
    const start = Date.now();
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);

    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
      const duration = Date.now() - start;
      console.log(
        `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`
      );
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };

  const errorLogger = (err, req, res, next) => {
    console.error(
      `${new Date().toISOString()} - ERROR - ${req.method} ${req.url} - ${err.message} - IP: ${req.ip}`
    );
    next(err);
  };

  module.exports = { logger, errorLogger };
  return;
}

// ✅ Local/VM: file logging is allowed
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = (req, res, next) => {
  const start = Date.now();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);

  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}\n`;

    fs.appendFile(path.join(logsDir, "access.log"), logMessage, (err) => {
      if (err) console.error("Error writing to log file:", err);
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

const errorLogger = (err, req, res, next) => {
  const errorMessage = `${new Date().toISOString()} - ERROR - ${req.method} ${req.url} - ${err.message} - IP: ${req.ip}\n`;

  fs.appendFile(path.join(logsDir, "error.log"), errorMessage, (e) => {
    if (e) console.error("Error writing to error log file:", e);
  });

  console.error("Error:", err.message);
  next(err);
};

module.exports = { logger, errorLogger };
