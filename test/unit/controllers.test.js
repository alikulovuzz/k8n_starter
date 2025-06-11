const healthController = require('../../src/controllers/healthController');
const loadController = require('../../src/controllers/loadController');
const authController = require('../../src/controllers/authController');

describe('HealthController', () => {
  it('should return health check message', async () => {
    const req = {};
    const res = {
      send: jest.fn()
    };

    await healthController.checkHealth(req, res);
    expect(res.send).toHaveBeenCalledWith('✅ Hello from Node.js HPA test!');
  });
});

describe('LoadController', () => {
  it('should handle load request', async () => {
    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await loadController.handleLoad(req, res);
    expect(res.send).toHaveBeenCalledWith('🌀 CPU load finished (5s)');
  }, 10000);
});

describe('AuthController', () => {
  it('should handle valid login request', async () => {
    const req = {
      body: {
        username: 'admin',
        password: 'password123'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await authController.login(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      token: expect.any(String)
    }));
  });

  it('should handle invalid login request', async () => {
    const req = {
      body: {
        username: 'wrong',
        password: 'wrong'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
}); 