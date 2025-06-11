const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/user.model');
const userService = require('../../src/services/userService');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('UserService', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '+998901234567',
    address: {
      street: 'Test Street',
      city: 'Test City',
      country: 'Uzbekistan',
      zipCode: '100000'
    }
  };

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = await userService.createUser(testUser);
      
      expect(user.name).toBe(testUser.name);
      expect(user.email).toBe(testUser.email);
      expect(user.phone).toBe(testUser.phone);
      expect(user.isActive).toBe(true);
      expect(user.password).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    it('should not create user with duplicate email', async () => {
      await userService.createUser(testUser);
      
      await expect(userService.createUser(testUser))
        .rejects
        .toThrow('E11000 duplicate key error');
    });
  });

  describe('getAllUsers', () => {
    it('should return all active users', async () => {
      await userService.createUser(testUser);
      await userService.createUser({
        ...testUser,
        email: 'test2@example.com',
        phone: '+998901234568'
      });

      const users = await userService.getAllUsers();
      
      expect(users).toHaveLength(2);
      expect(users[0].password).toBeUndefined();
    });

    it('should not return inactive users', async () => {
      const user = await userService.createUser(testUser);
      await userService.deleteUser(user._id);

      const users = await userService.getAllUsers();
      expect(users).toHaveLength(0);
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const user = await userService.createUser(testUser);
      const updatedData = {
        name: 'Updated Name',
        phone: '+998901234569'
      };

      const updated = await userService.updateUser(user._id, updatedData);
      
      expect(updated.name).toBe(updatedData.name);
      expect(updated.phone).toBe(updatedData.phone);
      expect(updated.email).toBe(testUser.email);
    });

    it('should not update to existing email', async () => {
      const user1 = await userService.createUser(testUser);
      const user2 = await userService.createUser({
        ...testUser,
        email: 'test2@example.com',
        phone: '+998901234568'
      });

      await expect(userService.updateUser(user2._id, { email: user1.email }))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const user = await userService.createUser(testUser);
      await userService.deleteUser(user._id);

      const deletedUser = await User.findById(user._id);
      expect(deletedUser.isActive).toBe(false);
    });
  });

  describe('password management', () => {
    it('should change password', async () => {
      const user = await userService.createUser(testUser);
      const newPassword = 'newpassword123';

      await userService.changePassword(user._id, testUser.password, newPassword);
      
      const updatedUser = await User.findById(user._id).select('+password');
      const isMatch = await updatedUser.comparePassword(newPassword);
      expect(isMatch).toBe(true);
    });

    it('should not change password with incorrect old password', async () => {
      const user = await userService.createUser(testUser);
      
      await expect(userService.changePassword(user._id, 'wrongpassword', 'newpassword123'))
        .rejects
        .toThrow('Current password is incorrect');
    });

    it('should reset password with valid token', async () => {
      const user = await userService.createUser(testUser);
      const resetToken = user.createPasswordResetToken();
      await user.save();

      const newPassword = 'resetpassword123';
      await userService.resetPassword(resetToken, newPassword);
      
      const updatedUser = await User.findById(user._id).select('+password');
      const isMatch = await updatedUser.comparePassword(newPassword);
      expect(isMatch).toBe(true);
    });
  });
}); 