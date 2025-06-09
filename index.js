const express = require('express');
const app = express();
const port = 3000;

// Asosiy endpoint
app.get('/', (req, res) => {
  res.send('✅ Hello from Node.js HPA test! 14:49');
});

// Yuklaydigan endpoint
app.get('/load', (req, res) => {
  const end = Date.now() + 5000; // 5 soniya CPU yuk
  while (Date.now() < end) {
    // CPUni band qilish (CPU intensive loop)
    Math.sqrt(Math.random() * Math.random());
  }
  res.send('🌀 CPU load finished (5s)');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});