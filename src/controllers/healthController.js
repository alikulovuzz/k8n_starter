class HealthController {
  async checkHealth(req, res) {
    res.send('✅ Hello from Node.js HPA test!');
  }
}

module.exports = new HealthController(); 