const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all forest fires
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM forest_fires ORDER BY id DESC';
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error fetching forest fires:', err);
            return res.status(500).json({ success: false, error: 'Server error while fetching forest fires' });
        }
        res.json({ success: true, data: rows });
    });
});

// GET forest fire by ID
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM forest_fires WHERE id = ?';
    db.query(sql, [req.params.id], (err, rows) => {
        if (err) {
            console.error('Error fetching forest fire:', err);
            return res.status(500).json({ success: false, error: 'Server error while fetching forest fire' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Forest fire not found' });
        }
        res.json({ success: true, data: rows[0] });
    });
});

// POST create forest fire
router.post('/', (req, res) => {
    const {
        fire_request_id,
        forest_name,
        location,
        district,
        state,
        fire_date,
        affected_area_hectares,
        fire_cause,
        status,
        officer_name,
        officer_contact,
        officer_designation,
        action_taken
    } = req.body;

    const errors = [];
    if (!forest_name) errors.push('forest_name is required');
    if (!location) errors.push('location is required');
    if (!district) errors.push('district is required');
    if (!state) errors.push('state is required');
    if (!fire_date) errors.push('fire_date is required');
    if (!officer_name) errors.push('officer_name is required');
    if (!officer_contact) errors.push('officer_contact is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const sql = `
        INSERT INTO forest_fires 
        (fire_request_id, forest_name, location, district, state, fire_date, affected_area_hectares, fire_cause, status, officer_name, officer_contact, officer_designation, action_taken) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [fire_request_id, forest_name, location, district, state, fire_date, affected_area_hectares, fire_cause, status, officer_name, officer_contact, officer_designation, action_taken];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating forest fire:', err);
            return res.status(500).json({ success: false, error: 'Server error while creating forest fire' });
        }

        // Fetch the newly created forest fire
        db.query('SELECT * FROM forest_fires WHERE id = ?', [result.insertId], (err2, rows2) => {
            if (err2) {
                console.error('Error fetching new forest fire:', err2);
                return res.status(500).json({ success: false, error: 'Error fetching new forest fire' });
            }

            res.status(201).json({ success: true, data: rows2[0] });
        });
    });
});

// PUT update forest fire
router.put('/:id', (req, res) => {
    const {
        fire_request_id,
        forest_name,
        location,
        district,
        state,
        fire_date,
        affected_area_hectares,
        fire_cause,
        status,
        officer_name,
        officer_contact,
        officer_designation,
        action_taken
    } = req.body;

    const errors = [];
    if (!forest_name) errors.push('forest_name is required');
    if (!location) errors.push('location is required');
    if (!district) errors.push('district is required');
    if (!state) errors.push('state is required');
    if (!fire_date) errors.push('fire_date is required');
    if (!officer_name) errors.push('officer_name is required');
    if (!officer_contact) errors.push('officer_contact is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const sql = `
        UPDATE forest_fires SET 
        fire_request_id = ?, forest_name = ?, location = ?, district = ?, state = ?, fire_date = ?, affected_area_hectares = ?, fire_cause = ?, status = ?, officer_name = ?, officer_contact = ?, officer_designation = ?, action_taken = ?
        WHERE id = ?
    `;
    const values = [fire_request_id, forest_name, location, district, state, fire_date, affected_area_hectares, fire_cause, status, officer_name, officer_contact, officer_designation, action_taken, req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating forest fire:', err);
            return res.status(500).json({ success: false, error: 'Server error while updating forest fire' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Forest fire not found' });
        }

        // Fetch updated data
        db.query('SELECT * FROM forest_fires WHERE id = ?', [req.params.id], (err2, rows2) => {
            if (err2) {
                return res.status(500).json({ success: false, error: 'Error fetching updated forest fire' });
            }

            res.json({ success: true, data: rows2[0] });
        });
    });
});

// DELETE forest fire
router.delete('/:id', (req, res) => {
    db.query('SELECT * FROM forest_fires WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Server error fetching forest fire' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Forest fire not found' });
        }

        const deletedFire = rows[0];

        db.query('DELETE FROM forest_fires WHERE id = ?', [req.params.id], (err2, result) => {
            if (err2) {
                return res.status(500).json({ success: false, error: 'Error deleting forest fire' });
            }

            res.json({ success: true, data: { message: 'Deleted successfully', deletedFire } });
        });
    });
});

module.exports = router;
