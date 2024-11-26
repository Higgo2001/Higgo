const express = require('express');
const app = express();

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the root path' });
});

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Root API route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app; 