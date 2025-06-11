const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token topilmadi' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Noto\'g\'ri token' });
  }
};

module.exports = authMiddleware; 