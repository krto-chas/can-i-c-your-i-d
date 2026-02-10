const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/secret', (req, res) => {
  res.json({
    message: 'Secret objective unlocked',
    hint: 'The Architect sees the full pipeline.'
  });
});

app.get('/', (req, res) => {
  res.send('First Pipeline Challenge - Week 4');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
