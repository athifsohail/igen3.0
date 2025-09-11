const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message);
      throw err;
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT,
            state TEXT,
            route TEXT,
            stateCode TEXT,
            gstin TEXT UNIQUE,
            mobile TEXT UNIQUE,
            email TEXT,
            aadhar TEXT
        )`, (err) => {
            if (err) {
                // Table already created
            }
        });
    }
});

module.exports = db;