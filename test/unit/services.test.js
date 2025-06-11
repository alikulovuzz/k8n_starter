const loadService = require('../../src/services/loadService');
const authService = require('../../src/services/authService');

describe('LoadService', () => {
  it('should simulate CPU load for 5 seconds', async () => {
    const startTime = Date.now();
    const result = await loadService.simulateCPULoad();
    const duration = Date.now() - startTime;

    expect(result).toBe('🌀 CPU load finished (5s)');
    expect(duration).toBeGreaterThanOrEqual(4900);
    expect(duration).toBeLessThan(5500);
  }, 10000);
});

describe('AuthService', () => {
  it('should generate token for valid credentials', async () => {
    const result = await authService.login('admin', 'password123');
    expect(result).toHaveProperty('token');
  });

  it('should reject invalid credentials', async () => {
    await expect(
      authService.login('wrong', 'wrong')
    ).rejects.toThrow('Noto\'g\'ri login ma\'lumotlari');
  });
}); 