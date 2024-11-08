import express from 'express';
import path from 'path';
import cors from 'cors';
import userRoutes from './routes/user.js';
import recordRoutes from './routes/record.js';

const app = express();

// Serve static files from React app (to fix later)
// app.use(express.static(path.join(__dirname, '../dist')));

app.use(express.json());
app.use(cors());

// Route handling
app.use("/api/signup", userRoutes);
app.use("/api/records", recordRoutes);

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
