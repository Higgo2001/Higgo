require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// MongoDB connection with debug info
let isConnected = false;
let lastError = null;

const connectToMongo = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect('mongodb+srv://higgosmit7:eEya82K8VnoXIx1r@sarecipe.nkqtv.mongodb.net/your_database_name?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    lastError = null;
    console.log('MongoDB Connected');
  } catch (error) {
    isConnected = false;
    lastError = error.message;
    console.error('MongoDB connection error:', error);
  }
};

// Debug route to check MongoDB status
app.get('/debug', async (req, res) => {
  await connectToMongo();
  res.json({
    mongodb: {
      isConnected: isConnected,
      connectionState: mongoose.connection.readyState,
      lastError: lastError,
      connectionString: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/:([^:@]{8})[^:@]*@/, ':****@') : 
        'Not configured'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the root path',
    availableEndpoints: {
      debug: '/debug',
      mongoTest: '/api/mongodb-test',
      api: '/api',
      test: '/api/test'
    },
    debug: 'Visit /debug to see MongoDB connection status'
  });
});

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    debug: 'Visit /debug to see MongoDB connection status'
  });
});

// Root API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to the API',
    debug: 'Visit /debug to see MongoDB connection status'
  });
});

// Example MongoDB test route
app.get('/api/mongodb-test', async (req, res) => {
  try {
    await connectToMongo();
    if (!isConnected) {
      throw new Error('MongoDB is not connected');
    }
    res.json({ 
      success: true,
      message: 'MongoDB is connected and working!',
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'MongoDB connection failed',
      error: error.message,
      connectionState: mongoose.connection.readyState
    });
  }
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    debug: 'Visit /debug to see MongoDB connection status'
  });
});

module.exports = app; 