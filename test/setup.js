// Test timeout ni oshirish
jest.setTimeout(30000);

// Global test hook'lari
beforeAll(() => {
  // Test muhiti uchun environment o'zgaruvchilarini o'rnatish
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.API_VERSION = 'v1';
}); 