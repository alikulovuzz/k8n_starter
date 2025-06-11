const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

describe('Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Test uchun token yaratish
    authToken = jwt.sign(
      { username: 'test', role: 'admin' },
      process.env.JWT_SECRET || 'test_secret'
    );

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

  describe('Health Check', () => {
    it('should return hello message', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.text).toBe('✅ Hello from Node.js HPA test!');
    });
  });

  describe('Authentication', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'password123'
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'wrong',
          password: 'wrong'
        })
        .expect(401);

      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Load Test', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/load')
        .expect(401);
    });

    it('should process load with valid token', async () => {
      const res = await request(app)
        .get('/load')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.text).toBe('🌀 CPU load finished (5s)');
    }, 10000);
  });

  describe('Users API', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+998901234567'
    };

    it('should require authentication for all user endpoints', async () => {
      await request(app).get('/users').expect(401);
      await request(app).post('/users').send(testUser).expect(401);
      await request(app).put('/users/1').send(testUser).expect(401);
      await request(app).delete('/users/1').expect(401);
    });

    describe('with authentication', () => {
      let createdUser;

      it('should create a new user', async () => {
        const res = await request(app)
          .post('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testUser)
          .expect(201);

        expect(res.body).toMatchObject(testUser);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('createdAt');
        createdUser = res.body;
      });

      it('should get all users', async () => {
        const res = await request(app)
          .get('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBeTruthy();
      });

      it('should update a user', async () => {
        // First create a user
        const createRes = await request(app)
          .post('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testUser);
        
        const updatedData = {
          ...testUser,
          name: 'Updated Name'
        };

        const res = await request(app)
          .put(`/users/${createRes.body.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updatedData)
          .expect(200);

        expect(res.body.name).toBe('Updated Name');
      });

      it('should delete a user', async () => {
        // First create a user
        const createRes = await request(app)
          .post('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testUser);

        const res = await request(app)
          .delete(`/users/${createRes.body.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body.message).toBe('Foydalanuvchi o\'chirildi');
        expect(res.body.user).toMatchObject(testUser);
      });

      it('should validate user data', async () => {
        const invalidUser = {
          name: 'A', // too short
          email: 'invalid-email', // invalid email
          phone: '123' // invalid phone
        };

        const res = await request(app)
          .post('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidUser)
          .expect(400);

        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors.length).toBeGreaterThan(0);
      });

      it('should prevent duplicate emails', async () => {
        // First create a user
        await request(app)
          .post('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testUser);

        // Try to create another user with same email
        const res = await request(app)
          .post('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testUser)
          .expect(409);

        expect(res.body).toHaveProperty('message');
      });
    });
  });
}); 