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
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    
    isConnected = true;
    lastError = null;
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    isConnected = false;
    lastError = error.message;
    console.error('MongoDB connection error:', error);
    
    // More detailed error logging
    if (error.name === 'MongoTimeoutError') {
      console.error('Connection timeout - Check network or MongoDB Atlas status');
    }
    if (error.name === 'MongoNetworkError') {
      console.error('Network error - Check your connection or MongoDB URI');
    }
  }
};

// Debug route to check MongoDB status
app.get('/debug', async (req, res) => {
  try {
    await connectToMongo();
    res.json({
      mongodb: {
        isConnected: isConnected,
        connectionState: mongoose.connection.readyState,
        lastError: lastError,
        databaseName: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting',
        }[mongoose.connection.readyState],
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get debug info',
      details: error.message
    });
  }
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

// Example MongoDB test route with better error handling
app.get('/api/mongodb-test', async (req, res) => {
  try {
    console.log('Attempting MongoDB connection...');
    await connectToMongo();
    
    if (!isConnected) {
      throw new Error('Failed to establish MongoDB connection');
    }

    // Try to perform a simple operation
    const dbPing = await mongoose.connection.db.admin().ping();
    
    res.json({ 
      success: true,
      message: 'MongoDB is connected and working!',
      connectionState: mongoose.connection.readyState,
      ping: dbPing,
      database: mongoose.connection.name
    });
  } catch (error) {
    console.error('MongoDB test failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'MongoDB connection failed',
      error: error.message,
      connectionState: mongoose.connection.readyState || 0,
      errorType: error.name,
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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