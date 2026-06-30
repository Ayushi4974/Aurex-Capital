const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);
  
  let status = err.statusCode || 500;
  if (err.message && (
    err.message.includes('Insufficient') ||
    err.message.includes('not found') ||
    err.message.includes('Invalid') ||
    err.message.includes('Minimum') ||
    err.message.includes('Maximum')
  )) {
    status = 400;
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
