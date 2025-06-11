const User = require('../models/user.model');

class UserService {
  async getAllUsers() {
    return await User.find({ isActive: true }).select('-password');
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async updateUser(id, userData) {
    const user = await User.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    Object.assign(user, userData);
    await user.save();
    return user;
  }

  async deleteUser(id) {
    const user = await User.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    await user.save();
    return user;
  }

  async findByEmail(email) {
    return await User.findOne({ email, isActive: true }).select('+password');
  }

  async updateLastLogin(userId) {
    await User.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
      isActive: true
    });
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!(await user.comparePassword(oldPassword))) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();
  }

  async resetPassword(resetToken, newPassword) {
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();
  }
}

module.exports = new UserService();
