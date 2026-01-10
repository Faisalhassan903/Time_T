const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));
} else {
  console.error('❌ MONGODB_URI not defined');
}

// Routes - Now using relative path from api folder
const timeEntriesRouter = require('./routes/timeEntries');
app.use('/api/time-entries', timeEntriesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Server is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Time Tracker API',
    status: 'running'
  });
});

module.exports = app;