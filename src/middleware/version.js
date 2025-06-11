const versionMiddleware = (req, res, next) => {
  const version = process.env.API_VERSION || 'v1';
  req.apiVersion = version;
  next();
};

module.exports = versionMiddleware; 