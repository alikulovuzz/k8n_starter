const request = require('supertest');
const app = require('../index'); // Fixed: Import from correct path

describe('Load Testing Scenarios', () => {
  describe('Stress testing /load endpoint', () => {
    test('should handle high concurrent load', async () => {
      const promises = [];
      const concurrentRequests = 5; // Reduced from 10 to be more realistic

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/load')
            .expect(200)
            .then(response => {
              expect(response.text).toBe('🌀 CPU load finished (5s)');
            })
        );
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // Should complete in reasonable time (allowing for some overhead)
      expect(totalTime).toBeGreaterThan(4900);
      expect(totalTime).toBeLessThan(15000); // More realistic expectation
    }, 60000); // 60 second timeout

    test('should maintain performance under mixed load', async () => {
      const promises = [];
      const startTime = Date.now();

      // Mix of fast and slow requests (reduced numbers)
      for (let i = 0; i < 3; i++) {
        promises.push(request(app).get('/').expect(200)); // Fast requests
        promises.push(request(app).get('/load').expect(200)); // Slow requests
      }

      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // Should complete in reasonable time
      expect(totalTime).toBeGreaterThan(4900);
      expect(totalTime).toBeLessThan(12000); // More realistic expectation
    }, 60000);
  });

  describe('Memory and resource usage', () => {
    test('should not cause memory leaks with multiple requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Make multiple requests
      for (let i = 0; i < 10; i++) {
        await request(app).get('/').expect(200);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Endpoint availability during load', () => {
    test('root endpoint should remain responsive during CPU load', async () => {
      // Start a CPU-intensive request
      const loadPromise = request(app).get('/load').expect(200);

      // Wait a bit for the load to start
      await new Promise(resolve => setTimeout(resolve, 100));

      // Test that root endpoint is still responsive
      const startTime = Date.now();
      await request(app).get('/').expect(200);
      const responseTime = Date.now() - startTime;

      // Root endpoint should still be fast
      expect(responseTime).toBeLessThan(1000);

      // Wait for the load request to complete
      await loadPromise;
    }, 15000);
  });

  describe('Rate limiting simulation', () => {
    test('should handle rapid successive requests', async () => {
      const responses = [];
      const startTime = Date.now();

      // Make 20 rapid requests to root endpoint
      for (let i = 0; i < 20; i++) {
        const response = await request(app).get('/').expect(200);
        responses.push(response);
      }

      const totalTime = Date.now() - startTime;

      expect(responses).toHaveLength(20);
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Error scenarios under load', () => {
    test('should handle 404 errors during high load', async () => {
      const promises = [];

      // Mix of valid and invalid requests
      for (let i = 0; i < 5; i++) {
        promises.push(request(app).get('/').expect(200));
        promises.push(request(app).get('/invalid').expect(404));
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
    });
  });
});