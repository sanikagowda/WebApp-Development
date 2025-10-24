const express = require('express');
const db = require('../db'); // Make sure db.js is correctly configured
const router = express.Router();

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database...');
});

// Route to get all fire service requests
router.get('/fire-requests', (req, res) => {
  const query = 'SELECT * FROM fire_requests ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).send('Failed to fetch requests');
    }
    res.status(200).json(results);
  });
});

// Route to submit a new fire service request
router.post('/fire-requests', (req, res) => {
  const { name, phone, incidentType, description, datetime, location, severity } = req.body;

  if (!name || !phone || !incidentType || !datetime || !location) {
    return res.status(400).send('Missing required fields');
  }

  const query = `INSERT INTO fire_requests (name, phone, incidentType, description, datetime, location, severity,status) VALUES (?, ?, ?, ?, ?, ?, ?,'Pending')`;
  const values = [name, phone, incidentType, description, datetime, location, severity];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting request:', err);
      return res.status(500).send('Failed to submit request');
    }
    res.status(201).send('Request submitted successfully');
  });
});

// Route to fetch all fire service requests
router.get('/fire-requests', (req, res) => {
    const query = 'SELECT * FROM fire_requests';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching requests:', err);
        return res.status(500).send('Failed to fetch requests');
      }
      res.json(results); // Send the result as JSON
    });
  });
  

module.exports = router;
