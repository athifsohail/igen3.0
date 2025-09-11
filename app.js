const express = require('express');
const cors = require('cors');
const path = require('path');

// Import your customer routes
const customerRoutes = require('./routes/customers.js');

const app = express();
const port = 3000; // Define the port

app.use(cors());
app.use(express.json());

// Use your routes for any request to /api/customers
app.use('/api/customers', customerRoutes);

// --- Serve all static files from the root directory ---
// This will automatically serve index.html, style.css, and script.js
app.use(express.static(path.join(__dirname)));

// --- Error Handling Middleware (add this after all routes) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ "error": "Something went wrong on the server." });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});