const userService = require('../services/userService');
const { success, error } = require('../utils/responseHandler');

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      success(res, 200, 'Foydalanuvchilar ro\'yxati', users);
    } catch (err) {
      error(res, 500, err.message);
    }
  }

  async createUser(req, res) {
    try {
      const user = await userService.createUser(req.body);
      success(res, 201, 'Foydalanuvchi yaratildi', user);
    } catch (err) {
      if (err.code === 11000) { // MongoDB duplicate key error
        return error(res, 400, 'Bu email allaqachon mavjud');
      }
      console.log(err);
      error(res, 400, err.message);
    }
  }

  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      
      if (!user) {
        return error(res, 404, 'Foydalanuvchi topilmadi');
      }

      success(res, 200, 'Foydalanuvchi yangilandi', user);
    } catch (err) {
      if (err.message === 'User not found') {
        return error(res, 404, 'Foydalanuvchi topilmadi');
      }
      if (err.message === 'Email already exists') {
        return error(res, 400, 'Bu email allaqachon mavjud');
      }
      error(res, 400, err.message);
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await userService.deleteUser(req.params.id);
      
      if (!user) {
        return error(res, 404, 'Foydalanuvchi topilmadi');
      }

      success(res, 200, 'Foydalanuvchi o\'chirildi', user);
    } catch (err) {
      if (err.message === 'User not found') {
        return error(res, 404, 'Foydalanuvchi topilmadi');
      }
      error(res, 500, err.message);
    }
  }
}

module.exports = new UserController(); 