const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Serve static files from React app (to fix later)
app.use(express.static(path.join(__dirname, '../dist')));

app.use(express.json());

app.use(function (req, res, next) {
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! env-cmd if need, prod
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// Sign up
app.post('/api/signup', (req, res) => {
  const { email, username, password } = req.body;
  console.log(email, username, password);
  //Hash/save user in db

  res.status(201).json({ message: 'User registered successfully' });
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
