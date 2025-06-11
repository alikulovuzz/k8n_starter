const userService = require('../../src/services/userService');
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

describe('UserService', () => {
  beforeAll(async () => {
    // data papkasini yaratish
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    } catch (error) {
      // papka allaqachon mavjud bo'lishi mumkin
    }
  });

  beforeEach(async () => {
    // Test uchun users.json ni tozalash
    try {
      await fs.writeFile(DATA_FILE, '[]');
    } catch (error) {
      console.error('Error writing to users.json:', error);
    }
  });

  describe('validateUser', () => {
    it('should validate correct user data', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+998901234567'
      };

      const errors = userService.validateUser(userData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid name', () => {
      const userData = {
        name: 'A', // juda qisqa
        email: 'test@example.com',
        phone: '+998901234567'
      };

      const errors = userService.validateUser(userData);
      expect(errors).toContain('Name must be at least 2 characters long');
    });

    it('should return errors for invalid email', () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email', // noto'g'ri email
        phone: '+998901234567'
      };

      const errors = userService.validateUser(userData);
      expect(errors).toContain('Valid email is required');
    });

    it('should return errors for invalid phone', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '123' // noto'g'ri telefon
      };

      const errors = userService.validateUser(userData);
      expect(errors).toContain('Valid phone number is required (min 10 digits)');
    });
  });

  describe('CRUD operations', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+998901234567'
    };

    it('should create a new user', async () => {
      const user = await userService.createUser(testUser);

      expect(user).toMatchObject(testUser);
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('createdAt');

      // Fayldan tekshirish
      const savedUsers = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
      expect(savedUsers).toHaveLength(1);
      expect(savedUsers[0]).toMatchObject(testUser);
    });

    it('should prevent duplicate emails', async () => {
      await userService.createUser(testUser);

      await expect(
        userService.createUser(testUser)
      ).rejects.toThrow('Email already exists');
    });

    it('should get all users', async () => {
      await userService.createUser(testUser);
      await userService.createUser({
        ...testUser,
        email: 'another@example.com'
      });

      const users = await userService.getAllUsers();
      expect(users).toHaveLength(2);
    });

    it('should update a user', async () => {
      const user = await userService.createUser(testUser);
      const updatedData = {
        ...testUser,
        name: 'Updated Name'
      };

      const updatedUser = await userService.updateUser(user.id, updatedData);
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser).toHaveProperty('updatedAt');

      // Fayldan tekshirish
      const savedUsers = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
      expect(savedUsers[0].name).toBe('Updated Name');
    });

    it('should throw error when updating non-existent user', async () => {
      await expect(
        userService.updateUser(999, testUser)
      ).rejects.toThrow('User not found');
    });

    it('should delete a user', async () => {
      const user = await userService.createUser(testUser);
      const deletedUser = await userService.deleteUser(user.id);

      expect(deletedUser).toMatchObject(testUser);

      // Fayldan tekshirish
      const savedUsers = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
      expect(savedUsers).toHaveLength(0);
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(
        userService.deleteUser(999)
      ).rejects.toThrow('User not found');
    });
  });

  describe('File operations', () => {
    it('should create data file if it does not exist', async () => {
      // Faylni o'chirish
      try {
        await fs.unlink(DATA_FILE);
      } catch (error) {
        // Fayl mavjud bo'lmasa xato bo'lishi mumkin
      }

      // Foydalanuvchi yaratish
      await userService.createUser({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+998901234567'
      });

      // Fayl yaratilganligini tekshirish
      const fileExists = await fs.access(DATA_FILE)
        .then(() => true)
        .catch(() => false);
      
      expect(fileExists).toBe(true);
    });

    it('should handle concurrent operations', async () => {
      const users = Array.from({ length: 5 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        phone: `+99890123456${i}`
      }));

      // Foydalanuvchilarni ketma-ket yaratish
      for (const user of users) {
        await userService.createUser(user);
      }

      // Barcha foydalanuvchilar saqlanganini tekshirish
      const savedUsers = await userService.getAllUsers();
      expect(savedUsers).toHaveLength(5);

      // Barcha foydalanuvchilar to'g'ri saqlanganini tekshirish
      users.forEach(user => {
        const savedUser = savedUsers.find(u => u.email === user.email);
        expect(savedUser).toBeTruthy();
        expect(savedUser.name).toBe(user.name);
        expect(savedUser.phone).toBe(user.phone);
      });
    });

    it('should handle parallel writes correctly', async () => {
      const users = Array.from({ length: 5 }, (_, i) => ({
        name: `User ${i}`,
        email: `parallel${i}@example.com`,
        phone: `+99890123456${i}`
      }));

      // Bir vaqtning o'zida barcha foydalanuvchilarni yaratishga urinish
      const createPromises = users.map(user => userService.createUser(user));
      await Promise.all(createPromises);

      // Barcha foydalanuvchilar saqlanganini tekshirish
      const savedUsers = await userService.getAllUsers();
      expect(savedUsers).toHaveLength(5);

      // Barcha foydalanuvchilar to'g'ri saqlanganini tekshirish
      users.forEach(user => {
        const savedUser = savedUsers.find(u => u.email === user.email);
        expect(savedUser).toBeTruthy();
        expect(savedUser.name).toBe(user.name);
        expect(savedUser.phone).toBe(user.phone);
      });
    });
  });
}); 