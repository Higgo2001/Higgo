require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Example = require('../models/Example');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Add error handler for MongoDB connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Add keepAlive option
mongoose.set('keepAlive', true);
mongoose.set('keepAliveInitialDelay', 300000);

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Vercel MERN API!' });
});

// Example CRUD endpoints
app.get('/api/examples', async (req, res) => {
  try {
    const examples = await Example.find();
    res.json(examples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/examples', async (req, res) => {
  const example = new Example({
    title: req.body.title,
    description: req.body.description,
  });

  try {
    const newExample = await example.save();
    res.status(201).json(newExample);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add this new route
app.get('/api/health', async (req, res) => {
  try {
    const status = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
      status: status,
      mongodb: status === 'connected' ? 'healthy' : 'unhealthy'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// For Vercel, we need to export the Express app as a module
module.exports = app; 