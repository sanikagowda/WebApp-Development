const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all fire victims
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM fire_victims ORDER BY id DESC';
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error fetching fire victims:', err);
            return res.status(500).json({ success: false, error: 'Server error while fetching fire victims' });
        }
        res.json({ success: true, data: rows });
    });
});

// GET fire victim by ID
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM fire_victims WHERE id = ?';
    db.query(sql, [req.params.id], (err, rows) => {
        if (err) {
            console.error('Error fetching fire victim:', err);
            return res.status(500).json({ success: false, error: 'Server error while fetching fire victim' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Fire victim not found' });
        }
        res.json({ success: true, data: rows[0] });
    });
});

// POST create fire victim
router.post('/', (req, res) => {
    const { fire_request_id, name, age, gender, contact_number, injury_details, medical_status, hospital_name, treatment_details } = req.body;

    const errors = [];
    if (!fire_request_id) errors.push('fire_request_id is required');
    if (!name) errors.push('name is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const sql = `
        INSERT INTO fire_victims 
        (fire_request_id, name, age, gender, contact_number, injury_details, medical_status, hospital_name, treatment_details) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [fire_request_id, name, age, gender, contact_number, injury_details, medical_status, hospital_name, treatment_details];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating fire victim:', err);
            return res.status(500).json({ success: false, error: 'Server error while creating fire victim' });
        }

        // Fetch the newly created fire victim
        db.query('SELECT * FROM fire_victims WHERE id = ?', [result.insertId], (err2, rows2) => {
            if (err2) {
                console.error('Error fetching new fire victim:', err2);
                return res.status(500).json({ success: false, error: 'Error fetching new fire victim' });
            }

            res.status(201).json({ success: true, data: rows2[0] });
        });
    });
});

// PUT update fire victim
router.put('/:id', (req, res) => {
    const { fire_request_id, name, age, gender, contact_number, injury_details, medical_status, hospital_name, treatment_details } = req.body;

    const errors = [];
    if (!fire_request_id) errors.push('fire_request_id is required');
    if (!name) errors.push('name is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const sql = `
        UPDATE fire_victims SET 
        fire_request_id = ?, name = ?, age = ?, gender = ?, contact_number = ?, injury_details = ?, medical_status = ?, hospital_name = ?, treatment_details = ?
        WHERE id = ?
    `;
    const values = [fire_request_id, name, age, gender, contact_number, injury_details, medical_status, hospital_name, treatment_details, req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating fire victim:', err);
            return res.status(500).json({ success: false, error: 'Server error while updating fire victim' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Fire victim not found' });
        }

        // Fetch updated data
        db.query('SELECT * FROM fire_victims WHERE id = ?', [req.params.id], (err2, rows2) => {
            if (err2) {
                return res.status(500).json({ success: false, error: 'Error fetching updated fire victim' });
            }

            res.json({ success: true, data: rows2[0] });
        });
    });
});

// DELETE fire victim
router.delete('/:id', (req, res) => {
    db.query('SELECT * FROM fire_victims WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Server error fetching fire victim' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Fire victim not found' });
        }

        const deletedVictim = rows[0];

        db.query('DELETE FROM fire_victims WHERE id = ?', [req.params.id], (err2, result) => {
            if (err2) {
                return res.status(500).json({ success: false, error: 'Error deleting fire victim' });
            }

            res.json({ success: true, data: { message: 'Deleted successfully', deletedVictim } });
        });
    });
});

module.exports = router;
