const express = require('express');
const db = require('../db');
const router = express.Router();

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Failed to connect to MySQL:', err.message);
    throw err;
  }
  console.log('Connected to MySQL Database...');
});

// Route to fetch all fire service requests
// Update your router.get('/rev-req') handler in your Express router
router.get('/rev-req', (req, res) => {
  try {
    const query = 'SELECT * FROM fire_requests';
    console.log('Executing query:', query); // Debug log
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching requests:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch requests',
          error: err.message,
        });
      }
      
      console.log('Query results:', results); // Debug log
      
      // Ensure consistent response format
      return res.json({
        success: true,
        data: results || [],
      });
    });
  } catch (error) {
    console.error('Server error in /rev-req:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Route to update fire service request status
router.put('/fire_request/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }
    const query = 'UPDATE fire_requests SET status = ? WHERE id = ?';
    console.log('Executing update query:', query, { status, id }); // Debug log
    db.query(query, [status, id], (err, result) => {
      if (err) {
        console.error('Error updating request:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to update request',
          error: err.message,
        });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: `Request with ID ${id} not found`,
        });
      }
      console.log('Update result:', result); // Debug log
      res.json({
        success: true,
        message: `Request ${status} successfully`,
      });
    });
  } catch (error) {
    console.error('Server error in /fire_request/:id:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;