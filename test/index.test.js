// app.test.js
const request = require('supertest');
const app = require('../index'); // Fixed: Import from correct path

describe('Node.js HPA Test Application', () => {
  describe('GET /', () => {
    test('should return hello message with status 200', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('✅ Hello from Node.js HPA test!');
    });

    test('should respond quickly (under 100ms)', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('GET /load', () => {
    test('should return CPU load finished message with status 200', async () => {
      const response = await request(app)
        .get('/load')
        .expect(200);

      expect(response.text).toBe('🌀 CPU load finished (5s)');
    }, 10000); // Increase timeout to 10 seconds

    test('should take approximately 5 seconds to complete', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/load')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeGreaterThan(4900); // At least 4.9 seconds
      expect(responseTime).toBeLessThan(5500); // Less than 5.5 seconds
    }, 10000); // Increase timeout to 10 seconds

    test('should handle multiple concurrent requests', async () => {
      const startTime = Date.now();

      // Start 3 concurrent requests
      const promises = [
        request(app).get('/load').expect(200),
        request(app).get('/load').expect(200),
        request(app).get('/load').expect(200)
      ];

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All responses should have the correct message
      responses.forEach(response => {
        expect(response.text).toBe('🌀 CPU load finished (5s)');
      });

      // Should take around 5-7 seconds (allowing for some overlap)
      expect(totalTime).toBeGreaterThan(4900);
      expect(totalTime).toBeLessThan(8000);
    }, 20000); // Increase timeout to 20 seconds
  });

  describe('Error handling', () => {
    test('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/nonexistent')
        .expect(404);
    });

    test('should handle malformed requests gracefully', async () => {
      await request(app)
        .get('/load?invalid=parameter')
        .expect(200); // Should still work since we don't use query params
    }, 10000);
  });

  describe('Server configuration', () => {
    test('should have correct content-type headers', async () => {
      const response = await request(app)
        .get('/');

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    test('should not expose sensitive server information', async () => {
      const response = await request(app)
        .get('/');

      // Should not expose server details in headers
      expect(response.headers['server']).toBeUndefined();
    });
  });

  describe('Performance tests', () => {
    test('root endpoint should be fast', async () => {
      const times = [];
      
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await request(app).get('/').expect(200);
        times.push(Date.now() - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(50); // Average should be under 50ms
    });

    test('load endpoint should be consistent', async () => {
      const times = [];
      
      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        await request(app).get('/load').expect(200);
        times.push(Date.now() - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeGreaterThan(4900);
      expect(avgTime).toBeLessThan(5500);
    }, 30000); // Increase timeout to 30 seconds for 3 sequential requests
  });
});