const express = require('express');
const router = express.Router();
const db = require('../database.js');

// GET all customers
router.get('/', (req, res) => {
    const sql = "SELECT * FROM customers ORDER BY name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// POST a new customer
router.post('/', (req, res) => {
    const { name, address, state, route, stateCode, gstin, mobile, email, aadhar } = req.body;

    if (!name || !address) {
        res.status(400).json({ "error": "Name and Address are mandatory" });
        return;
    }

    const sql = `INSERT INTO customers (name, address, state, route, stateCode, gstin, mobile, email, aadhar)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, address, state, route, stateCode, gstin, mobile, email, aadhar];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, ...req.body }
        });
    });
});

module.exports = router;


// --- Serve the frontend ---
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// --- Error Handling Middleware (add this after all routes) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ "error": "Something went wrong on the server." });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});