const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom logger middleware
 */
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}\n`;
    
    // Write to log file
    fs.appendFile(path.join(logsDir, 'access.log'), logMessage, (err) => {
      if (err) console.error('Error writing to log file:', err);
    });
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Error logger
 */
const errorLogger = (err, req, res, next) => {
  const errorMessage = `${new Date().toISOString()} - ERROR - ${req.method} ${req.url} - ${err.message} - IP: ${req.ip}\n`;
  
  // Write to error log file
  fs.appendFile(path.join(logsDir, 'error.log'), errorMessage, (err) => {
    if (err) console.error('Error writing to error log file:', err);
  });
  
  console.error('Error:', err.message);
  next(err);
};

module.exports = {
  logger,
  errorLogger
};
