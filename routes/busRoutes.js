const express = require('express');
const db = require('../db'); // Make sure db.js is correctly configured
const router = express.Router();

// Get all bus details
router.get('/bus-details', (req, res) => {
  const sql = 'SELECT * FROM busdetails';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json(results);
  });
});

// Get a single bus detail by ID
router.get('/bus-details/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM busdetails WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Bus not found' });
    }
  });
});

// Add a new bus
router.post('/bus-details', (req, res) => {
  const {
    busno, chasisno, wheelbase, battery, watertankmaterial, manhole,
    pumptype, pumpdischarge, delivery, make, overalllength, overallwidth,
    overhallheight, bodyroof, bodydoortype, bodylocks, watertankcapacity
  } = req.body;

  const sql = `INSERT INTO busdetails 
    (busno, chasisno, wheelbase, battery, watertankmaterial, manhole, 
    pumptype, pumpdischarge, delivery, make, overalllength, overallwidth, 
    overhallheight, bodyroof, bodydoortype, bodylocks, watertankcapacity) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    busno, chasisno, wheelbase, battery, watertankmaterial, manhole,
    pumptype, pumpdischarge, delivery, make, overalllength, overallwidth,
    overhallheight, bodyroof, bodydoortype, bodylocks, watertankcapacity
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to insert bus details', error: err.message });
    }
    res.status(201).json({ message: 'Bus details added successfully', id: result.insertId });
  });
});

// Update a bus detail
router.put('/bus-details/:id', (req, res) => {
  const { id } = req.params;
  const { busno, chasisno, wheelbase, battery, watertankmaterial, manhole, pumptype, pumpdischarge, delivery, make, overalllength, overallwidth, overhallheight, bodyroof, bodydoortype, bodylocks, watertankcapacity } = req.body;

  const sql = `UPDATE busdetails SET 
    busno=?, chasisno=?, wheelbase=?, battery=?, watertankmaterial=?, manhole=?, 
    pumptype=?, pumpdischarge=?, delivery=?, make=?, overalllength=?, overallwidth=?, 
    overhallheight=?, bodyroof=?, bodydoortype=?, bodylocks=?, watertankcapacity=? 
    WHERE id=?`;

  const values = [
    busno, chasisno, wheelbase, battery, watertankmaterial, manhole,
    pumptype, pumpdischarge, delivery, make, overalllength, overallwidth,
    overhallheight, bodyroof, bodydoortype, bodylocks, watertankcapacity, id
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to update bus details', error: err.message });
    }
    res.json({ message: 'Bus details updated successfully' });
  });
});

// Delete a bus detail
router.delete('/bus-details/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM busdetails WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to delete bus details', error: err.message });
    }
    res.json({ message: 'Bus details deleted successfully' });
  });
});

module.exports = router;
