require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Example = require('../models/Example');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB only when the API is called
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    cachedDb = client;
    console.log('MongoDB Connected');
    return client;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Routes
app.get('/api', async (req, res) => {
  await connectToDatabase();
  res.json({ message: 'Welcome to Vercel MERN API!' });
});

// Example CRUD endpoints
app.get('/api/examples', async (req, res) => {
  try {
    await connectToDatabase();
    const examples = await Example.find();
    res.json(examples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/examples', async (req, res) => {
  try {
    await connectToDatabase();
    const example = new Example({
      title: req.body.title,
      description: req.body.description,
    });
    const newExample = await example.save();
    res.status(201).json(newExample);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
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

// For Vercel, export the Express app
module.exports = app; 