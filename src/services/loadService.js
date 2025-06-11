class LoadService {
  async simulateCPULoad() {
    const startTime = Date.now();
    
    // 5 sekundlik CPU load simulyatsiyasi
    while (Date.now() - startTime < 5000) {
      // CPU load
      Math.random() * Math.random();
    }
    
    return '🌀 CPU load finished (5s)';
  }
}

module.exports = new LoadService(); 