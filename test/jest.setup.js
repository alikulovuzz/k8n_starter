// jest.setup.js
// Global test setup and configuration

// Test setup file
const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'users.json');

beforeEach(() => {
  // Clear any timers before each test
  jest.clearAllTimers();
});

afterEach(async () => {
  // Clean up any remaining timers after each test
  jest.clearAllTimers();
  
  // Clean up users file after each test if it exists
  try {
    await fs.unlink(USERS_FILE);
  } catch (error) {
    // File doesn't exist, that's fine
  }
});

// Global cleanup after all tests
afterAll(async () => {
  try {
    await fs.unlink(USERS_FILE);
  } catch (error) {
    // File doesn't exist, that's fine
  }
});

// Increase default timeout for all tests
jest.setTimeout(30000);

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock console.log during tests to reduce noise
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Global test helpers
global.testHelpers = {
  // Helper to wait for a specific amount of time
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to measure execution time
  measureTime: async (fn) => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  },
  
  // Helper to create multiple concurrent requests
  createConcurrentRequests: (app, endpoint, count) => {
    const request = require('supertest');
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      promises.push(request(app).get(endpoint));
    }
    
    return promises;
  }
};

// Performance monitoring
let testStartTime;
let testResults = [];


beforeEach(() => {
  testStartTime = Date.now();
});

afterEach(() => {
  const testDuration = Date.now() - testStartTime;
  const testName = expect.getState().currentTestName;
  
  testResults.push({
    name: testName,
    duration: testDuration,
    timestamp: new Date().toISOString()
  });
});

// After all tests, log performance summary
afterAll(() => {
  if (process.env.NODE_ENV === 'test') {
    console.log('\n=== Test Performance Summary ===');
    testResults
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10) // Top 10 slowest tests
      .forEach(test => {
        console.log(`${test.name}: ${test.duration}ms`);
      });
  }
});

// Export for use in tests
module.exports = {
  testHelpers: global.testHelpers
};