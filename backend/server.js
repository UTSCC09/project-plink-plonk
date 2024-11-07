const express = require('express');
const path = require('path');
const app = express();

// Serve static files from React app (to fix later)
app.use(express.static(path.join(__dirname, '../dist')));

// Sign up
app.post('api/signup', (req, res) => {
  const { email, username, password } = req.body;
});

// API route ex.
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// Catch-all route to serve React's index.html for all non-API routes .. apparently. fix later
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // this should be printed in termina fs
});
