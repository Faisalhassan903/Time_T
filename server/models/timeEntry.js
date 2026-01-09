const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  totalHours: {
    type: Number,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  siteLocation: {
    type: String,
    required: true,
    default: 'Office'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);