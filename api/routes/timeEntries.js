const express = require('express');
const router = express.Router();
const TimeEntry = require('../models/TimeEntry');
const ExcelJS = require('exceljs');
const TimeEntry = require('../models/TimeEntry');

// Helper function to calculate hours
const calculateHours = (start, end) => {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startTotal = startHour + startMin / 60;
  const endTotal = endHour + endMin / 60;
  
  let diff = endTotal - startTotal;
  if (diff < 0) diff += 24;
  
  return Math.round(diff * 100) / 100;
};

// GET all entries
router.get('/', async (req, res) => {
  try {
    const entries = await TimeEntry.find().sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET entries by month
router.get('/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const entries = await TimeEntry.find({ 
      year: parseInt(year),
      month: month 
    }).sort({ date: 1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching month entries:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST new entry
router.post('/', async (req, res) => {
  try {
    const { date, startTime, endTime, siteLocation } = req.body;
    
    const entryDate = new Date(date);
    const totalHours = calculateHours(startTime, endTime);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const entry = new TimeEntry({
      date: entryDate,
      startTime,
      endTime,
      totalHours,
      day: days[entryDate.getDay()],
      month: months[entryDate.getMonth()],
      year: entryDate.getFullYear(),
      siteLocation: siteLocation || 'Office'
    });

    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(400).json({ message: error.message });
  }
});

// UPDATE entry (PUT)
router.put('/:id', async (req, res) => {
  try {
    const { date, startTime, endTime, siteLocation } = req.body;
    
    const entryDate = new Date(date);
    const totalHours = calculateHours(startTime, endTime);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const updatedEntry = await TimeEntry.findByIdAndUpdate(
      req.params.id,
      {
        date: entryDate,
        startTime,
        endTime,
        totalHours,
        day: days[entryDate.getDay()],
        month: months[entryDate.getMonth()],
        year: entryDate.getFullYear(),
        siteLocation: siteLocation || 'Office'
      },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    await TimeEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: error.message });
  }
});

// EXPORT to Excel
router.get('/export/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const entries = await TimeEntry.find({ 
      year: parseInt(year),
      month: month 
    }).sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${month} ${year}`);

    // Add headers with site location
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Day', key: 'day', width: 12 },
      { header: 'Site Location', key: 'siteLocation', width: 20 },
      { header: 'Start Time', key: 'startTime', width: 12 },
      { header: 'End Time', key: 'endTime', width: 12 },
      { header: 'Total Hours', key: 'totalHours', width: 12 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Add data with site location
    entries.forEach(entry => {
      worksheet.addRow({
        date: entry.date.toLocaleDateString('en-GB'),
        day: entry.day,
        siteLocation: entry.siteLocation || 'Office',
        startTime: entry.startTime,
        endTime: entry.endTime,
        totalHours: entry.totalHours
      });
    });

    // Add total
    const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
    worksheet.addRow({});
    const totalRow = worksheet.addRow({
      date: 'TOTAL',
      totalHours: totalHours.toFixed(2)
    });
    totalRow.font = { bold: true };

    // Send file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=timesheet-${month}-${year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;