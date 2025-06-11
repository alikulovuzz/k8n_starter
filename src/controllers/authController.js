const authService = require('../services/authService');
const { success, error } = require('../utils/responseHandler');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return error(res, 400, 'Email va parol kiritish majburiy');
      }

      const result = await authService.login(email, password);
      
      // x-access-token headerini o'rnatish
      res.set('x-access-token', result.token);
      
      success(res, 200, 'Tizimga muvaffaqiyatli kirdingiz', result);
    } catch (err) {
      error(res, 401, err.message);
    }
  }

  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      // x-access-token headerini o'rnatish
      res.set('x-access-token', result.token);
      
      success(res, 201, 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz', result);
    } catch (err) {
      error(res, 400, err.message);
    }
  }

  verifyToken(req, res) {
    try {
      const token = req.headers['x-access-token'];
      
      if (!token) {
        return error(res, 401, 'Token topilmadi');
      }

      const decoded = authService.verifyToken(token);
      success(res, 200, 'Token yaroqli', decoded);
    } catch (err) {
      error(res, 401, err.message);
    }
  }
}

module.exports = new AuthController(); 