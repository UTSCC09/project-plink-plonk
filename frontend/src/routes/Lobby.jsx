import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Peer from "peerjs";

import BackLink from "../components/BackLink";

import { createGestureRecognizer, hasGetUserMedia } from "../js/mediapipe.mjs"; 

export async function loader({ params }) {
  createGestureRecognizer();

  // If webcam supported, add event listener to button to activate webcam.
  if (hasGetUserMedia()) {
    document.getElementById("webcamButton").addEventListener("click", toggleCam);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }
  return { contact };
}

export default function Lobby() {
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [messages, setMessages] = useState([]);

  const params = useParams();





  useEffect(() => {
    // Creating Peer instance
    const newPeer = new Peer();
    setPeer(newPeer);

    // Setting up peer ID once peer's initialized
    newPeer.on("open", (id) => {
      console.log("Connected with ID:", id);
      setLobbyId(id); // Use as lobby/game ID
    });

    // Listen for incoming connections!! b09 flashbacks >.<
    newPeer.on("connection", (conn) => {
      console.log("Player joined the game:", conn.peer);
      setConnection(conn);
      conn.on("data", (data) => {
        if (data === "join-game") {
          console.log("Player ready to start the game");
          setIsGameStarted(true);
          conn.send("start-game");
        } else {
          setMessages((prev) => [...prev, `Opponent: ${data}`]);
        }
      });
    });

    return () => newPeer.destroy(); // Cleanup at end!
  }, []);

  const conn = peer.connect(lobbyId);
    setConnection(conn);

  conn.on("open", () => {
    console.log("Connected to host");
    conn.send("join-game"); // Notify host we wanna join
  });

  conn.on("data", (data) => {
    if (data === "start-game") {
      console.log("Game is starting!");
      setIsGameStarted(true);
    } else {
      setMessages((prev) => [...prev, `Opponent: ${data}`]);
    }
  });

  function sendMessage(message) {
    if (connection && connection.open) {
      connection.send(message);
      setMessages((prev) => [...prev, `You: ${message}`]);
    }
  }

  

  return (
    <div>
      <BackLink />
      {isGameStarted && (
        <div>
          <h2>Game Room</h2>
          <div>
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
          <button onClick={() => sendMessage("Hello from me!")}>
            Send Message
          </button>
        </div>
      )}
    </div>
  );
}