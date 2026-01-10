const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({

  origin: [

    'http://localhost:3000',

    'https://timetrackerapi.vercel.app/'  // Replace with YOUR actual frontend URL

  ],

  credentials: true

}));
app.use(express.json());

// MongoDB Connection
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 MONGODB_URI exists:', !!MONGODB_URI);
console.log('🔍 MONGODB_URI length:', MONGODB_URI ? MONGODB_URI.length : 0);

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      console.error('❌ Full error:', err);
    });
} else {
  console.error('❌ MONGODB_URI not defined in environment');
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