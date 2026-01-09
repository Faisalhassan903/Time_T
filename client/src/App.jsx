import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/time-entries';

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    siteLocation: ''
  });
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().toLocaleString('default', { month: 'long' })
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      alert('❌ Error loading entries. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startTime || !formData.endTime) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingEntry) {
        // Update existing entry
        await axios.put(`${API_URL}/${editingEntry._id}`, formData);
        alert('✅ Entry updated successfully!');
        setEditingEntry(null);
      } else {
        // Create new entry
        await axios.post(API_URL, formData);
        alert('✅ Entry added successfully!');
      }
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        siteLocation: ''
      });
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('❌ Error saving entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: new Date(entry.date).toISOString().split('T')[0],
      startTime: entry.startTime,
      endTime: entry.endTime,
      siteLocation: entry.siteLocation || ''
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      siteLocation: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('❌ Error deleting entry');
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/export/${selectedMonth.year}/${selectedMonth.month}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timesheet-${selectedMonth.month}-${selectedMonth.year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('❌ Error exporting to Excel');
    }
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>⏱️ Time Tracker</h1>
        <p>Track your work hours effortlessly</p>
      </div>

      {/* Add/Edit Entry Form */}
      <div className="card">
        <h2>{editingEntry ? '✏️ Edit Time Entry' : 'Add Time Entry'}</h2>
        
        {editingEntry && (
          <div style={{
            background: '#fef3c7',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #f59e0b'
          }}>
            <strong>📝 Editing mode active</strong>
            <button 
              onClick={handleCancelEdit}
              style={{
                marginLeft: '15px',
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel Edit
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Site Location</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., London Office, Client ABC, Home, etc."
              value={formData.siteLocation}
              onChange={(e) => setFormData({...formData, siteLocation: e.target.value})}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                className="input"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                className="input"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary">
            {editingEntry ? '💾 Update Entry' : '➕ Add Entry'}
          </button>
        </form>
      </div>

      {/* Export Section */}
      <div className="card">
        <h2>📥 Export to Excel</h2>
        
        <div className="form-row-3">
          <div className="form-group">
            <label>Month</label>
            <select 
              className="input"
              value={selectedMonth.month}
              onChange={(e) => setSelectedMonth({...selectedMonth, month: e.target.value})}
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              className="input"
              value={selectedMonth.year}
              onChange={(e) => setSelectedMonth({...selectedMonth, year: e.target.value})}
              min="2020"
              max="2030"
            />
          </div>
          
          <div className="form-group">
            <label>&nbsp;</label>
            <button onClick={handleExport} className="btn btn-secondary">
              📥 Download Excel
            </button>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="card">
        <div className="stats">
          <h2 style={{margin: 0, border: 'none'}}>Time Entries</h2>
          <div className="total-hours">
            <small style={{color: '#666'}}>Total Hours: </small>
            <span>{totalHours.toFixed(2)}h</span>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <p>No entries yet. Add your first time entry above! 👆</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Site Location</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry._id} style={{
                    background: editingEntry?._id === entry._id ? '#fef3c7' : ''
                  }}>
                    <td>{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                    <td>{entry.day}</td>
                    <td>
                      <span style={{
                        background: '#e0e7ff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        📍 {entry.siteLocation || 'N/A'}
                      </span>
                    </td>
                    <td>{entry.startTime}</td>
                    <td>{entry.endTime}</td>
                    <td>
                      <span className="hours-badge">{entry.totalHours}h</span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button 
                          onClick={() => handleEdit(entry)}
                          className="btn"
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '8px 12px',
                            fontSize: '14px'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(entry._id)}
                          className="btn btn-danger"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;