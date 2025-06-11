const { success } = require('../utils/responseHandler');

class HealthController {
  check(req, res) {
    success(res, 200, 'Server is running', {
      timestamp: new Date(),
      uptime: process.uptime()
    });
  }
}

module.exports = new HealthController();