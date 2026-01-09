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

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/time-entries', require('./routes/timeEntries'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Server is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mongoUri: MONGODB_URI ? 'set' : 'missing'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Time Tracker API' });
});

// Export for Vercel (NO app.listen!)
module.exports = app;