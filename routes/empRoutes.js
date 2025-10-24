const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all employees
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM employeedetails ORDER BY id DESC';
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ success: false, error: 'Server error while fetching employees' });
    }
    res.json({ success: true, data: rows });
  });
});

// GET employee by ID
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM employeedetails WHERE id = ?';
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) {
      console.error('Error fetching employee:', err);
      return res.status(500).json({ success: false, error: 'Server error while fetching employee' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: rows[0] });
  });
});

// POST create employee
router.post('/', (req, res) => {
  const { EmployeeRegId, Name, Phone, Email, Designation, Qualification } = req.body;

  const errors = [];
  if (!EmployeeRegId) errors.push('EmployeeRegId is required');
  if (!Name) errors.push('Name is required');
  if (!Phone) errors.push('Phone is required');
  if (!Email) errors.push('Email is required');
  if (!Designation) errors.push('Designation is required');
  if (!Qualification) errors.push('Qualification is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const sql = `
    INSERT INTO employeedetails 
    (EmployeeRegId, Name, Phone, Email, Designation, Qualification) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [EmployeeRegId, Name, Phone, Email, Designation, Qualification];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error creating employee:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, error: 'Employee with this registration ID already exists' });
      }
      return res.status(500).json({ success: false, error: 'Server error while creating employee' });
    }

    // Fetch the newly created employee
    db.query('SELECT * FROM employeedetails WHERE id = ?', [result.insertId], (err2, rows2) => {
      if (err2) {
        console.error('Error fetching new employee:', err2);
        return res.status(500).json({ success: false, error: 'Error fetching new employee' });
      }

      res.status(201).json({ success: true, data: rows2[0] });
    });
  });
});

// PUT update employee
router.put('/:id', (req, res) => {
  const { EmployeeRegId, Name, Phone, Email, Designation, Qualification } = req.body;

  const errors = [];
  if (!EmployeeRegId) errors.push('EmployeeRegId is required');
  if (!Name) errors.push('Name is required');
  if (!Phone) errors.push('Phone is required');
  if (!Email) errors.push('Email is required');
  if (!Designation) errors.push('Designation is required');
  if (!Qualification) errors.push('Qualification is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const sql = `
    UPDATE employeedetails SET 
    EmployeeRegId = ?, Name = ?, Phone = ?, Email = ?, Designation = ?, Qualification = ?
    WHERE id = ?
  `;
  const values = [EmployeeRegId, Name, Phone, Email, Designation, Qualification, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating employee:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, error: 'Duplicate EmployeeRegId' });
      }
      return res.status(500).json({ success: false, error: 'Server error while updating employee' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // Fetch updated data
    db.query('SELECT * FROM employeedetails WHERE id = ?', [req.params.id], (err2, rows2) => {
      if (err2) {
        return res.status(500).json({ success: false, error: 'Error fetching updated employee' });
      }

      res.json({ success: true, data: rows2[0] });
    });
  });
});

// DELETE employee
router.delete('/:id', (req, res) => {
  db.query('SELECT * FROM employeedetails WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Server error fetching employee' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const deletedEmployee = rows[0];

    db.query('DELETE FROM employeedetails WHERE id = ?', [req.params.id], (err2, result) => {
      if (err2) {
        return res.status(500).json({ success: false, error: 'Error deleting employee' });
      }

      res.json({ success: true, data: { message: 'Deleted successfully', deletedEmployee } });
    });
  });
});

module.exports = router;
