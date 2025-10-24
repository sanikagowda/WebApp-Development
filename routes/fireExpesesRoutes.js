const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all fire expenses
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM fire_expenses ORDER BY id DESC';
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error fetching fire expenses:', err);
            return res.status(500).json({ success: false, error: 'Server error while fetching fire expenses' });
        }
        res.json({ success: true, data: rows });
    });
});

// GET fire expense by ID
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM fire_expenses WHERE id = ?';
    db.query(sql, [req.params.id], (err, rows) => {
        if (err) {
            console.error('Error fetching fire expense:', err);
            return res.status(500).json({ success: false, error: 'Server error while fetching fire expense' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Fire expense not found' });
        }
        res.json({ success: true, data: rows[0] });
    });
});

// POST create fire expense
router.post('/', (req, res) => {
    const { fire_request_id, expense_type, amount, description, date_incurred, approved_by } = req.body;

    const errors = [];
    if (!fire_request_id) errors.push('fire_request_id is required');
    if (!expense_type) errors.push('expense_type is required');
    if (!amount) errors.push('amount is required');
    if (!date_incurred) errors.push('date_incurred is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const sql = `
        INSERT INTO fire_expenses 
        (fire_request_id, expense_type, amount, description, date_incurred, approved_by) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [fire_request_id, expense_type, amount, description, date_incurred, approved_by];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating fire expense:', err);
            return res.status(500).json({ success: false, error: 'Server error while creating fire expense' });
        }

        // Fetch the newly created fire expense
        db.query('SELECT * FROM fire_expenses WHERE id = ?', [result.insertId], (err2, rows2) => {
            if (err2) {
                console.error('Error fetching new fire expense:', err2);
                return res.status(500).json({ success: false, error: 'Error fetching new fire expense' });
            }

            res.status(201).json({ success: true, data: rows2[0] });
        });
    });
});

// PUT update fire expense
router.put('/:id', (req, res) => {
    const { fire_request_id, expense_type, amount, description, date_incurred, approved_by } = req.body;

    const errors = [];
    if (!fire_request_id) errors.push('fire_request_id is required');
    if (!expense_type) errors.push('expense_type is required');
    if (!amount) errors.push('amount is required');
    if (!date_incurred) errors.push('date_incurred is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const sql = `
        UPDATE fire_expenses SET 
        fire_request_id = ?, expense_type = ?, amount = ?, description = ?, date_incurred = ?, approved_by = ?
        WHERE id = ?
    `;
    const values = [fire_request_id, expense_type, amount, description, date_incurred, approved_by, req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating fire expense:', err);
            return res.status(500).json({ success: false, error: 'Server error while updating fire expense' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Fire expense not found' });
        }

        // Fetch updated data
        db.query('SELECT * FROM fire_expenses WHERE id = ?', [req.params.id], (err2, rows2) => {
            if (err2) {
                return res.status(500).json({ success: false, error: 'Error fetching updated fire expense' });
            }

            res.json({ success: true, data: rows2[0] });
        });
    });
});

// DELETE fire expense
router.delete('/:id', (req, res) => {
    db.query('SELECT * FROM fire_expenses WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Server error fetching fire expense' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Fire expense not found' });
        }

        const deletedExpense = rows[0];

        db.query('DELETE FROM fire_expenses WHERE id = ?', [req.params.id], (err2, result) => {
            if (err2) {
                return res.status(500).json({ success: false, error: 'Error deleting fire expense' });
            }

            res.json({ success: true, data: { message: 'Deleted successfully', deletedExpense } });
        });
    });
});

module.exports = router;
