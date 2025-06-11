const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../index');

const USERS_FILE = path.join(__dirname, '..', 'users.json');

describe('User Management API', () => {
  // Clean up users file before and after tests
  beforeEach(async () => {
    try {
      await fs.unlink(USERS_FILE);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    try {
      await fs.unlink(USERS_FILE);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  describe('POST /users', () => {
    test('should create a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      });
      expect(response.body.createdAt).toBeDefined();
    });

    test('should reject user with missing name', async () => {
      const userData = {
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toContain('Name is required and must be a non-empty string');
    });

    test('should reject user with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toContain('Email must be a valid email address');
    });

    test('should reject user with missing phone', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toContain('Phone number is required and must be a non-empty string');
    });

    test('should reject duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      // Create first user
      await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const duplicateUser = {
        name: 'Jane Doe',
        email: 'john@example.com',
        phone: '+0987654321'
      };

      const response = await request(app)
        .post('/users')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.error).toBe('Email already exists');
    });

    test('should handle email case insensitivity', async () => {
      const userData1 = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const userData2 = {
        name: 'Jane Doe',
        email: 'JOHN@EXAMPLE.COM',
        phone: '+0987654321'
      };

      // Create first user
      await request(app)
        .post('/users')
        .send(userData1)
        .expect(201);

      // Try to create second user with same email in different case
      const response = await request(app)
        .post('/users')
        .send(userData2)
        .expect(409);

      expect(response.body.error).toBe('Email already exists');
    });

    test('should trim whitespace from name and phone', async () => {
      const userData = {
        name: '  John Doe  ',
        email: 'john@example.com',
        phone: '  +1234567890  '
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body.name).toBe('John Doe');
      expect(response.body.phone).toBe('+1234567890');
    });
  });

  describe('GET /users', () => {
    test('should return empty array when no users exist', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all users', async () => {
      // Create multiple users
      const users = [
        { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321' }
      ];

      for (const user of users) {
        await request(app).post('/users').send(user);
      }

      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('John Doe');
      expect(response.body[1].name).toBe('Jane Smith');
    });
  });

  describe('PUT /users/:id', () => {
    test('should update existing user', async () => {
      // Create a user first
      const createResponse = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        });

      const userId = createResponse.body.id;

      // Update the user
      const updatedData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '+1111111111'
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe('John Updated');
      expect(response.body.email).toBe('john.updated@example.com');
      expect(response.body.phone).toBe('+1111111111');
      expect(response.body.updatedAt).toBeDefined();
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/users/999')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        })
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    test('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .put('/users/invalid')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid user ID');
    });

    test('should reject duplicate email when updating', async () => {
      // Create two users
      await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        });

      const user2Response = await request(app)
        .post('/users')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321'
        });

      // Try to update user2 with user1's email
      const response = await request(app)
        .put(`/users/${user2Response.body.id}`)
        .send({
          name: 'Jane Smith',
          email: 'john@example.com',
          phone: '+0987654321'
        })
        .expect(409);

      expect(response.body.error).toBe('Email already exists');
    });

    test('should allow updating user with same email (no change)', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        });

      // Update user with same email but different name
      const response = await request(app)
        .put(`/users/${createResponse.body.id}`)
        .send({
          name: 'John Updated',
          email: 'john@example.com',
          phone: '+1234567890'
        })
        .expect(200);

      expect(response.body.name).toBe('John Updated');
    });
  });

  describe('DELETE /users/:id', () => {
    test('should delete existing user', async () => {
      // Create a user first
      const createResponse = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        });

      const userId = createResponse.body.id;

      // Delete the user
      const response = await request(app)
        .delete(`/users/${userId}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');
      expect(response.body.user.name).toBe('John Doe');

      // Verify user is deleted
      const getResponse = await request(app)
        .get('/users')
        .expect(200);

      expect(getResponse.body).toHaveLength(0);
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/users/999')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    test('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .delete('/users/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid user ID');
    });
  });

  describe('Integration tests', () => {
    test('should handle complete CRUD operations', async () => {
      // Create user
      const createResponse = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        })
        .expect(201);

      const userId = createResponse.body.id;

      // Read user
      let getResponse = await request(app)
        .get('/users')
        .expect(200);
      expect(getResponse.body).toHaveLength(1);

      // Update user
      await request(app)
        .put(`/users/${userId}`)
        .send({
          name: 'John Updated',
          email: 'john.updated@example.com',
          phone: '+1111111111'
        })
        .expect(200);

      // Verify update
      getResponse = await request(app)
        .get('/users')
        .expect(200);
      expect(getResponse.body[0].name).toBe('John Updated');

      // Delete user
      await request(app)
        .delete(`/users/${userId}`)
        .expect(200);

      // Verify deletion
      getResponse = await request(app)
        .get('/users')
        .expect(200);
      expect(getResponse.body).toHaveLength(0);
    });

    test('should handle multiple users with auto-incrementing IDs', async () => {
      const users = [
        { name: 'User 1', email: 'user1@example.com', phone: '+1111111111' },
        { name: 'User 2', email: 'user2@example.com', phone: '+2222222222' },
        { name: 'User 3', email: 'user3@example.com', phone: '+3333333333' }
      ];

      const createdUsers = [];
      for (const user of users) {
        const response = await request(app)
          .post('/users')
          .send(user)
          .expect(201);
        createdUsers.push(response.body);
      }

      // Verify IDs are sequential
      expect(createdUsers[0].id).toBe(1);
      expect(createdUsers[1].id).toBe(2);
      expect(createdUsers[2].id).toBe(3);

      // Delete middle user
      await request(app)
        .delete(`/users/${createdUsers[1].id}`)
        .expect(200);

      // Create new user - should get next available ID
      const newUserResponse = await request(app)
        .post('/users')
        .send({ name: 'User 4', email: 'user4@example.com', phone: '+4444444444' })
        .expect(201);

      expect(newUserResponse.body.id).toBe(4);
    });
  });
});