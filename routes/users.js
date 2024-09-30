const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../auth');
const router = express.Router();

const JWT_SECRET = 'not_a_real_secret';

module.exports = (db) => {
  router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
      db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, row) => {
        if (row) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run('INSERT INTO Users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
          if (err) {
            console.error('Error during signup:', err);
            return res.status(500).json({ message: 'Internal server error' });
          }
          res.status(201).json({ message: 'User created successfully', user: { id: this.lastID, email } });
        });
      });
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Logging in for ${email}`);

    db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (!row || !(await bcrypt.compare(password, row.password))) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const newTokenVersion = row.tokenVersion + 1;

      db.run('UPDATE Users SET tokenVersion = ? WHERE id = ?', [newTokenVersion, row.id], function (updateErr) {
        if (updateErr) {
          console.error('Error updating tokenVersion:', updateErr);
          return res.status(500).json({ message: 'Internal server error' });
        }

        const token = jwt.sign({ id: row.id, email: row.email, tokenVersion: newTokenVersion }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
      });
    });
  });

  router.delete('/:email', authenticateToken, async (req, res) => {
    const { email } = req.params;
    console.log(`Deleting  user ${email}`);
    try {
      if (req.user.email !== email) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      db.run('DELETE FROM Users WHERE email = ?', [email], function (err) {
        if (err) {
          console.error('Error during user deletion:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
      });
    }
    catch (error) {
      console.error('Error during user deletion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/refresh-token', (req, res) => {
    const token = req.body.token;

    if (!token) {
      return res.status(403).json({ message: 'Refresh token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });

      validateToken(user.id, user.tokenVersion, (err, isValid) => {
        if (err) return res.status(500).json({ message: 'Internal server error' });
        if (!isValid) return res.status(403).json({ message: 'Invalid refresh token' });

        const accessToken = jwt.sign(
          { id: user.id, tokenVersion: user.tokenVersion },
          JWT_SECRET,
          { expiresIn: '15m' }
        );

        res.json({ accessToken });
      });
    });
  });

  router.post('/logout', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`Logging out ${userId}`);
    db.run('UPDATE Users SET tokenVersion = tokenVersion + 1 WHERE id = ?', [userId], function (err) {
      if (err) {
        console.error('Error logging out:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.status(200).json({ message: 'Logged out' });
    });
  });


  return router;
};
