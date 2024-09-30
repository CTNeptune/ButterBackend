const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const dbPath = './database.sqlite';
const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    if (!dbExists) {
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          tokenVersion INTEGER DEFAULT 0
        )`);

        db.serialize(() => {
          db.run(`CREATE TABLE IF NOT EXISTS Catalogs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            notes TEXT,
            tags TEXT,
            userId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES Users(id)
          )`);
        });
        
        db.run(`CREATE TABLE IF NOT EXISTS Movies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          formats TEXT NOT NULL,
          is3D BOOLEAN NOT NULL,
          devicesRequiredFor3D TEXT NOT NULL,
          tags TEXT,
          notes TEXT,
          userId TEXT NOT NULL,
          catalogId TEXT,
          FOREIGN KEY(catalogId) REFERENCES Catalogs(id)
        )`);
      });
    }
  }
});

const usersRoute = require('./routes/users');
const catalogsRoute = require('./routes/catalogs');
const moviesRoute = require('./routes/movies');

app.use('/users', usersRoute(db));
app.use('/catalogs', catalogsRoute(db));
app.use('/movies', moviesRoute(db));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Welcome to the Butter Backend!');
});
