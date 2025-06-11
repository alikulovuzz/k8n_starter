/**
 * Success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 */
exports.success = (res, statusCode = 200, message = 'Success', data = null) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
exports.error = (res, statusCode = 500, message = 'Internal server error') => {
  res.status(statusCode).json({
    status: 'error',
    message
  });
}; 