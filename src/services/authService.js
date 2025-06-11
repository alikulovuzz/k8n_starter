const jwt = require('jsonwebtoken');

class AuthService {
  async login(username, password) {
    // Bu yerda haqiqiy autentifikatsiya logikasi bo'lishi kerak
    // Misol uchun database bilan tekshirish
    if (username === 'admin' && password === 'password123') {
      const token = jwt.sign(
        { username, role: 'admin' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );
      return { token };
    }
    
    throw new Error('Noto\'g\'ri login ma\'lumotlari');
  }
}

module.exports = new AuthService(); 