const loadService = require('../services/loadService');

class LoadController {
  async handleLoad(req, res) {
    try {
      const result = await loadService.simulateCPULoad();
      res.send(result);
    } catch (error) {
      res.status(500).json({ message: 'Server xatosi' });
    }
  }
}

module.exports = new LoadController(); 