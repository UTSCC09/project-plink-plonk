import { useState, useEffect } from "react";
import Peer from "peerjs";

const GameComponent = () => {
  const [peer, setPeer] = useState(null);
  const [gameId, setGameId] = useState("");
  const [connection, setConnection] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Creating Peer instance 
    const newPeer = new Peer();
    setPeer(newPeer);

    // Setting up peer ID once peer's initialized
    newPeer.on("open", (id) => {
      console.log("Connected with ID:", id);
      setGameId(id); // Use as lobby/game ID
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

  const hostGame = () => {
    setIsHost(true);
    console.log("Hosting game with ID:", gameId);
  };

  const joinGame = () => {
    const conn = peer.connect(gameId);
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
  };

  const sendMessage = (msg) => {
    if (connection && connection.open) {
      connection.send(msg);
      setMessages((prev) => [...prev, `You: ${msg}`]);
    }
  };

  // a lil wonky for now, I just put the id in the enter bar for the time being
  // "boiler plate" if you will
  return (
    <div>
      <h1>{isHost ? "Game Lobby (Host)" : "Join Game"}</h1>
      {!isGameStarted && (
        <div>
          {!isHost ? (
            <>
              <input
                type="text"
                placeholder="Enter Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />
              <button onClick={joinGame}>Join Game</button>
              <button onClick={hostGame}>Host Game</button>  
            </>
          ) : (
            <>
              <p>Share this game ID with another player to join: {gameId}</p>
              <button onClick={() => setIsGameStarted(true)}>
                Start Game
              </button>
            </>
          )}
        </div>
      )}
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
};

export default GameComponent;
