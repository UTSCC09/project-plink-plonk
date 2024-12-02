import express, { application } from "express";
import db from "../db/connection.js";
import bcrypt from "bcrypt";
import { parse, serialize } from "cookie";

const router = express.Router();

// later to-do: isAuthenticated check
function isAuthenticated(req, res, next) {
  if (!req.session.username) return res.status(401).end("Access denied :( ");
  return next();
}

// User signup route
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersCollection = await db.collection("users");
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: `Username ${username} already exists` });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { nickname: username, username, password: hashedPassword };  
    const result = await usersCollection.insertOne(newUser);
    res
      .status(201)
      .json({
        message: "User registered successfully",
        userId: result.insertedId,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// User login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ username });

    if (!user) {
      // Check password securely in real implementation
      return res.status(401).json({ message: "No user found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.username = username;

    res.setHeader(
      "Set-Cookie",
      serialize("nickname", user.nickname, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    res.status(200).json({ message: "Login successful", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});

router.get("/check-auth", (req, res) => {
  if (req.session.username) {
    return res.json({ message: "Authenticated" });
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
});

// User signout route
router.get("/signout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to destroy session" });
    }
  });

  res.clearCookie("connect.sid", { path: "/" });

  res.setHeader(
    "Set-Cookie",
    serialize("nickname", "", {
      path: "/",
      maxAge: 0, // 1 week in number of seconds
    })
  );
  return res.status(200).json({ message: "User has been signed out" });
});

router.patch("/change-nickname", isAuthenticated, async (req, res) => {
  const { nickname } = req.body;
  try {
    const usersCollection = db.collection("users");
    const result = await usersCollection.updateOne({ username: req.session.username }, { $set: { nickname:nickname }});

    res.setHeader(
      "Set-Cookie",
      serialize("nickname", nickname, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    if (result.matchedCount === 1) {
      res.status(200).json({ message: "Nickname updated successfully!" });
    } else {
      res.status(400).json({ message: "Failed to update nickname!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error changing nickname!" });
  }
});

export default router;
