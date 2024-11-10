import express from "express";
import db from '../db/connection.js';

const router = express.Router();

 // later to-do: isAuthenticated check
 
// User signup route
router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  // TODO: Add password hashing, validation, etc.

  try {
    const usersCollection = await db.collection('users');
    const newUser = { email, username, password }; // Add hashed password here in real implementation
    const result = await usersCollection.insertOne(newUser);
    console.log(email, username, password);

    res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Logic for login (e.g., verify username and password)
  try {
    const usersCollection = await db.collection('users');
    const user = await usersCollection.findOne({ username });

    if (!user || user.password !== password) { // Check password securely in real implementation
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router;
