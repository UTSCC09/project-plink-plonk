import express from "express";
import db from "../db/connection.js";
import session from "express-session";

const router = express.Router();

// Creating a new lobby
router.post("/create", async (req, res) => {
  const { name, code, visibility } = req.body;
  try {
    const lobbyCollection = await db.collection("lobbies");

    const existingLobby = await lobbyCollection.findOne({ code });

    if (existingLobby) {
      return res
        .status(409)
        .json({ message: `Lobby with code ${code} already exists` });
    }

    const newLobby = {
      name,
      code,
      visibility,
      host: req.username,
      members: [],
    };

    const result = await lobbyCollection.insertOne(newLobby);

    res.status(201).json({
      message: "Lobby successfully created",
      lobbyId: code,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating lobby" });
  }
});

// Check existing lobby
router.get("/exist/:name/:code", async (req, res) => {
  const { name, code } = req.params;
  try {
    const lobbyCollection = await db.collection("lobbies");
    const existingCode = await lobbyCollection.findOne({ code });
    const existingName = await lobbyCollection.findOne({ name });

    if (existingCode) {
      return res
        .status(409)
        .json({ message: `Lobby with code ${code} already exists` });
    }

    if (existingName) {
      return res
        .status(409)
        .json({ message: `Lobby with name ${name} already exists` });
    }

    res.status(200).json({
      message: "Lobby does not exist yet",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error querying database :(" });
  }
});

// Check is Host
router.get("/:code", async (req, res) => {
  const { code } = req.params;
  console.log("Okay here:");
  console.log("Searching for lobby with code:", code);

  try {
    const lobbyCollection = await db.collection("lobbies");

    //const allLobbies = await lobbyCollection.find().toArray();
    //console.log("All Lobbies:", allLobbies);

    const lobbyCode = await lobbyCollection.findOne({ code });
    if (!lobbyCode) {
      // If no lobby code is found, respond with an error
      return res.status(404).json({ error: "Lobby not found" });
    }

    const host = lobbyCode.host;

    if (req.username == host) {
      return res
        .status(200)
        .json({ message: `User ${req.username} is indeed the host` });
    }

    res.status(409).json({
      message: `User ${req.username}is not the host`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error querying database :(" });
  }
});

// Joining a lobby

// Deleting a lobby

// Close lobby visiblity (when you)
router.patch("/close/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const lobbyCollection = await db.collection("lobbies");

    //const allLobbies = await lobbyCollection.find().toArray();
    //console.log("All Lobbies:", allLobbies);

    await lobbyCollection.updateOne(
      { code }, // Filter to find the lobby
      { $set: { visibility: "Private" } }  
    );

    res.status(200).json({
      message: `Lobby visibility updated to Private.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error querying database :(" });
  }
});

// Get public lobbies
router.get("/public", async (req, res) => {
  try {
    console.log("Getting public lobbies");
    const lobbyCollection = await db.collection("lobbies");

    const publicLobbies = await lobbyCollection.find({ visibility: "Public" }).toArray();

    // Respond with the list of public lobbies
    res.status(200).json({
      message: "Got public lobbies",
      data: publicLobbies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error querying database :(" });
  }
});

export default router;
