const userService = require('../services/userService');

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Foydalanuvchilarni olishda xatolik' });
    }
  }

  async createUser(req, res) {
    try {
      const validationErrors = userService.validateUser(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }

      const newUser = await userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      if (error.message === 'Email already exists') {
        return res.status(409).json({ message: 'Bu email allaqachon mavjud' });
      }
      res.status(500).json({ message: 'Foydalanuvchi yaratishda xatolik' });
    }
  }

  async updateUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Noto\'g\'ri ID formati' });
      }

      const validationErrors = userService.validateUser(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }

      const updatedUser = await userService.updateUser(id, req.body);
      res.json(updatedUser);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
      }
      if (error.message === 'Email already exists') {
        return res.status(409).json({ message: 'Bu email allaqachon mavjud' });
      }
      res.status(500).json({ message: 'Foydalanuvchini yangilashda xatolik' });
    }
  }

  async deleteUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Noto\'g\'ri ID formati' });
      }

      const deletedUser = await userService.deleteUser(id);
      res.json({ message: 'Foydalanuvchi o\'chirildi', user: deletedUser });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
      }
      res.status(500).json({ message: 'Foydalanuvchini o\'chirishda xatolik' });
    }
  }
}

module.exports = new UserController(); 