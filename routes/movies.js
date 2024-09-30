const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');

module.exports = (db) => {
    router.post('/', authenticateToken, (req, res) => {
        const { id, name, formats, is3D, devicesRequiredFor3D, tags, notes, userId, catalogId } = req.body;
        const formatsStringArray = formats.map(format => {
            return format.toString();
        });
        const threeDDevicesStringArray = formats.map(format => {
            return devicesRequiredFor3D.toString();
        });
        const tagsArray = formats.map(format => {
            return tags.toString();
        });
        db.run('INSERT INTO Movies (id, name, formats, is3D, devicesRequiredFor3D, tags, notes, userId, catalogId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, name, JSON.stringify(formatsStringArray), is3D, JSON.stringify(threeDDevicesStringArray), JSON.stringify(tagsArray), notes, userId, catalogId], function (err) {
            if (err) {
                console.error('Error creating movie:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.status(201).json({ id, name, formats: formatsStringArray, is3D, devicesRequiredFor3D, tags, notes, userId, catalogId });
        });
    });

    router.get('/', authenticateToken, (req, res) => {
        const userId = req.query.userId;
        db.all('SELECT * FROM Movies WHERE ? = userId', [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching movies:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(rows);
        });
    });

    router.get('/catalog/', authenticateToken, (req, res) => {
        const catalogId = req.query.catalogId;
        db.all('SELECT * FROM Movies WHERE ? = catalogId', [catalogId], (err, rows) => {
            if (err) {
                console.error('Error fetching movies:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(rows);
        });
    });

    router.get('/:id', authenticateToken, (req, res) => {
        const { id } = req.params;
        db.get('SELECT * FROM Movies WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error fetching movie:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (!row) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            res.json(row);
        });
    });

    router.put('/:id', authenticateToken, (req, res) => {
        const { id } = req.params;
        const { name, formats, is3D, devicesRequiredFor3D, tags, notes } = req.body;
        db.run('UPDATE Movies SET name = ?, formats = ?, is3D = ?, devicesRequiredFor3D = ?, tags = ?, notes = ? WHERE id = ?', [name, JSON.stringify(formats), is3D, JSON.stringify(devicesRequiredFor3D), JSON.stringify(tags), notes, id], function (err) {
            if (err) {
                console.error('Error updating movie:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            db.get('SELECT * FROM Movies WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error('Error fetching updated movie:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.status(200).json(row);
            });
        });
    });

    router.delete('/:id', authenticateToken, (req, res) => {
        const { id } = req.params;
        db.run('DELETE FROM Movies WHERE id = ?', [id], function (err) {
            if (err) {
                console.error('Error deleting movie:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            res.status(204).send();
        });
    });

    return router;
};
