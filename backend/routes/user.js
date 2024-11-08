import express from "express";
import db from '../db/connection.js';

const router = express.Router();

// User signup route
router.post('/', async (req, res) => {
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

export default router;
