const express = require('express');
const db = require('../db');
const router = express.Router();

// Get All Modules
router.get('/modules', (req, res) => {
  const sql = 'SELECT name, status, metrics FROM modules';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    // Parse metrics JSON
    const modules = results.map((row) => ({
      ...row,
      metrics: JSON.parse(row.metrics),
    }));
    res.json(modules);
  });
});

module.exports = router;