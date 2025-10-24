const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../db');
const router = express.Router();

// Send OTP
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  // Validate email input
  if (!email || !email.includes('@')) {
    console.error('Invalid email provided:', email);
    return res.status(400).json({ message: 'Invalid email address' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(`Generated OTP for ${email}: ${otp}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Rescue Flame - Reset Password OTP',
    text: `Your OTP for Rescue Flame password reset is ${otp}. It is valid for 10 minutes.`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Email sending failed:', err.message);
      // Store OTP in DB even if email fails (for testing)
      db.query('UPDATE user SET otp = ? WHERE email = ?', [otp, email], (dbErr) => {
        if (dbErr) {
          console.error('Database error during OTP storage:', dbErr.message);
          return res.status(500).json({ message: 'Database error', error: dbErr.message });
        }
        console.log(`OTP ${otp} stored for ${email}, but email failed`);
        return res.status(500).json({
          message: 'Failed to send OTP email, but OTP is stored. Check server logs.',
          otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Return OTP in dev mode
        });
      });
    } else {
      console.log('Email sent successfully:', info.response);
      db.query('UPDATE user SET otp = ? WHERE email = ?', [otp, email], (dbErr) => {
        if (dbErr) {
          console.error('Database error after email sent:', dbErr.message);
          return res.status(500).json({ message: 'Database error', error: dbErr.message });
        }
        console.log(`OTP ${otp} stored for ${email}`);
        res.status(200).json({ message: 'OTP sent to your email' });
      });
    }
  });
});

// Reset Password
router.post('/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Validate inputs
  if (!email || !otp || !newPassword) {
    console.error('Missing required fields:', { email, otp, newPassword });
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  const sql = 'SELECT * FROM user WHERE email = ? AND otp = ?';
  db.query(sql, [email, otp], (err, result) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (result.length === 0) {
      console.log(`Invalid OTP attempt for ${email}: ${otp}`);
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    db.query('UPDATE user SET password = ?, otp = NULL WHERE email = ?', [newPassword, email], (updateErr) => {
      if (updateErr) {
        console.error('Database update error:', updateErr.message);
        return res.status(500).json({ message: 'Server error', error: updateErr.message });
      }
      console.log(`Password reset successful for ${email}`);
      res.status(200).json({ message: 'Password reset successful' });
    });
  });
});

module.exports = router;