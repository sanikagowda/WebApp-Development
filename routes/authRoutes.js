const express = require('express');
const db = require('../db');
const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  console.log('Register request:', { name, email, password, role });
  const sql = 'INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, password, role], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Registration failed', error: err.message });
    }
    console.log('User registered:', result.insertId);
    res.status(201).send('Registration successful');
  });
});

// Login
router.post('/login', (req, res) => {  //processes requests
  const { email, password } = req.body;
  const sql = 'SELECT * FROM user WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (result.length > 0) {
      res.json({ success: true, role: result[0].role,user_id:result[0].id }); //response
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

router.post('/change-password', (req, res) => {
  const { user_id, currentPassword, newPassword } = req.body;

  // Validate input
  if (!user_id || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Query to find the user by user_id
  const sql = 'SELECT * FROM user WHERE id = ?';
  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error occurred', error: err.message });
    }

    const user = result[0];
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Verify current password
    if (user.password === currentPassword) {
      const updateSql = 'UPDATE user SET password = ? WHERE id = ?';
      db.query(updateSql, [newPassword, user.id], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Failed to update password', error: err.message });
        }
        res.json({ success: true });
      });
    } else {
      res.status(401).send('Incorrect current password');
    }
  });
});

router.get('/users', (req, res) => {
  const sql = 'SELECT id, name, email, role FROM user';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json(results);
  });
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM user WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.send('User deleted successfully');
  });
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const sql = 'UPDATE user SET name = ?, email = ?, role = ? WHERE id = ?';
  db.query(sql, [name, email, role, id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.send('User updated successfully');
  });
});


router.get('/dashboard', async (req, res) => {
  try {
    const stats = {};

    // Count total buses
    stats.totalBuses = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) AS count FROM busdetails', (err, result) => {
        if (err) return reject(err);
        resolve(result[0].count);
      });
    });

    // Count total employees
    stats.totalEmployees = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) AS count FROM employeedetails', (err, result) => {
        if (err) return reject(err);
        resolve(result[0].count);
      });
    });

    // Count total fire requests
    stats.totalFireRequests = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) AS count FROM fire_requests', (err, result) => {
        if (err) return reject(err);
        resolve(result[0].count);
      });
    });

    // Count total resolved fire requests
    stats.resolvedFireRequests = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) AS count FROM fire_requests WHERE status = "Resolved"', (err, result) => {
        if (err) return reject(err);
        resolve(result[0].count);
      });
    });

    // Total fire expenses
    stats.totalFireExpenses = await new Promise((resolve, reject) => {
      db.query('SELECT SUM(amount) AS total FROM fire_expenses', (err, result) => {
        if (err) return reject(err);
        resolve(result[0].total || 0);
      });
    });

    // Recent fire requests (last 5 records)
    stats.recentFireRequests = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id, name, incidentType, datetime, location, severity, status FROM fire_requests ORDER BY datetime DESC LIMIT 5',
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    // Recent fire expenses (last 5 records)
    stats.recentFireExpenses = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id, fire_request_id, expense_type, amount, date_incurred FROM fire_expenses ORDER BY date_incurred DESC LIMIT 5',
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).send('Unable to fetch dashboard stats');
  }
});
module.exports = router;