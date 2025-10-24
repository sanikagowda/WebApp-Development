const express = require('express');
const db = require('../db'); // Use your existing db config
const router = express.Router();

// Get all bus services
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM busservice';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch bus services', error: err.message });
    }
    res.json(results);
  });
});

// Add new bus service
router.post('/', (req, res) => {
  const { Busno, date, serviceDescription, Amount } = req.body;

  if (!Busno || !date || !serviceDescription || !Amount) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sql = 'INSERT INTO busservice (Busno, date, serviceDescription, Amount) VALUES (?, ?, ?, ?)';
  db.query(sql, [Busno, date, serviceDescription, Amount], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to add bus service', error: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      Busno,
      date,
      serviceDescription,
      Amount,
    });
  });
});

// Update bus service
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { Busno, date, serviceDescription, Amount } = req.body;

  if (!Busno || !date || !serviceDescription || !Amount) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sql = 'UPDATE busservice SET Busno = ?, date = ?, serviceDescription = ?, Amount = ? WHERE id = ?';
  db.query(sql, [Busno, date, serviceDescription, Amount, id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to update bus service', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bus service not found' });
    }
    res.json({
      id,
      Busno,
      date,
      serviceDescription,
      Amount,
    });
  });
});

// Delete bus service
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM busservice WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to delete bus service', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bus service not found' });
    }
    res.json({ message: 'Bus service deleted successfully' });
  });
});

module.exports = router;