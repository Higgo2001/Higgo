const express = require('express');
const app = express();

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Root API route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

module.exports = app; 