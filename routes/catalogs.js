const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth')

module.exports = (db) => {
    router.post('/', authenticateToken, (req, res) => {
        const {id, name, notes, tags, userId } = req.body;
        db.run('INSERT INTO Catalogs (id, name, notes, tags, userId) VALUES (?, ?, ?, ?, ?)', [id, name, notes, JSON.stringify(tags), userId], function (err) {
            if (err) {
                console.error('Error creating catalog:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.status(201).json({ id, name, notes, tags, userId });
        });
    });


    router.get('/users/', authenticateToken, (req, res) => {
        const userId = req.query.userId;
        db.all('SELECT * FROM Catalogs WHERE userId = ?', [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching catalogs:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(rows);
        });
    });
    

    router.get('/:id', authenticateToken, (req, res) => {
        const { id } = req.params;
        db.get('SELECT * FROM Catalogs WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error fetching catalog:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (!row) {
                return res.status(404).json({ message: 'Catalog not found' });
            }
            res.json(row);
        });
    });

    router.put('/:id', authenticateToken, (req, res) => {
        const { id } = req.params;
        const { name, notes, tags } = req.body;
        db.run('UPDATE Catalogs SET name = ?, notes = ?, tags = ? WHERE id = ?', [name, notes, JSON.stringify(tags), id], function (err) {
            if (err) {
                console.error('Error updating catalog:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Catalog not found' });
            }
            db.get('SELECT * FROM Catalogs WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error('Error fetching updated catalog:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.status(200).json(row);
            });
        });
    });

    router.delete('/:id', authenticateToken, (req, res) => {
        const { id } = req.params;
        db.run('DELETE FROM Catalogs WHERE id = ?', [id], function (err) {
            if (err) {
                console.error('Error deleting catalog:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Catalog not found' });
            }
            res.status(204).send();
        });
    });

    return router;
};
