const jwt = require('jsonwebtoken');
const userService = require('./userService');

class AuthService {
  async login(email, password) {
    const user = await userService.findByEmail(email);
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Noto\'g\'ri email yoki parol');
    }

    // Oxirgi login vaqtini yangilash
    await userService.updateLastLogin(user._id);

    // Token yaratish
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  async register(userData) {
    const user = await userService.createUser(userData);

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Yaroqsiz token');
    }
  }
}

module.exports = new AuthService(); 