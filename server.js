const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ API ishlayapti!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/stress', (req, res) => {
    const stress = req.query.stress || 1000;
    const delay = req.query.delay || 1000;
    const count = req.query.count || 1000;
    const data = req.query.data || 'Hello, world!';
    for (let i = 0; i < count; i++) {
        console.log(data);
        setTimeout(() => {
            console.log(data);
        }, delay);
    }
    res.json({ status: 'ok' });
  });

app.listen(port, () => {
  console.log(`🚀 Server ${port} portda ishlayapti`);
});
