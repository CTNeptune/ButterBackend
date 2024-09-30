const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const JWT_SECRET = 'not_a_real_secret';

const validateToken = (userId, tokenVersion, callback) => {
    db.get('SELECT tokenVersion FROM Users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err);
            return callback(err);
        }
        if (!row || row.tokenVersion !== tokenVersion) {
            return callback(null, false);
        }
        return callback(null, true);
    });
};

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Token required' });

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        validateToken(user.id, user.tokenVersion, (err, isValid) => {
            if (err) return res.status(500).json({ message: 'Internal server error' });
            if (!isValid) return res.status(403).json({ message: 'Token is no longer valid' });
            req.user = user;
            next();
        });
    });
};

module.exports = { authenticateToken };
