const buffer = require('buffer');
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}

let app;
let bootError = null;

try {
  app = require('../backend/src/app');
} catch (err) {
  bootError = err;
  console.error('Serverless boot error:', err);
}

module.exports = (req, res) => {
  if (bootError) {
    return res.status(500).json({
      success: false,
      message: bootError.message || 'Server initialization failed',
      stack: bootError.stack,
      nodeVersion: process.version,
    });
  }
  return app(req, res);
};
