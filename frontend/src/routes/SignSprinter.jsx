import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";

import BackLink from "../components/BackLink";
import Game from "../components/Game";
import Webcam from "../components/Webcam";

import { getLobby } from "../js/lobby.mjs";
import { generateProblemText, generateProblem } from "../js/problemBank.mjs";

const RACE_LENGTH = 5;

export async function loader({ params }) {
  const lobbyDetails = await getLobby(params.lobbyId);
  return { lobbyDetails };
}

export default function Lobby({ lobbyDetails, hasWebcam = true }) {
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lobbyIdInput, setLobbyIdInput] = useState("");
  const [countdown, setCountdown] = useState(null);

  const gameNotifications = useRef(null);
  const [gameEnd, setGameEnd] = useState(RACE_LENGTH);
  const [gameProgress, setGameProgress] = useState(0);
  const [question, setQuestion] = useState(null);
  const [currentSign, setCurrentSign] = useState(null);

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      console.log("PeerJS connected with ID:", id);
    });

    newPeer.on("connection", (conn) => {
      console.log("Player joined the game:", conn.peer);
      setConnection(conn);
    });

    return () => {
      newPeer.destroy();
    };
  }, []);

  const handleConnect = () => {
    if (!peer || !lobbyIdInput) return;

    try {
      const conn = peer.connect(lobbyIdInput);
      setConnection(conn);

      conn.on("open", () => {
        console.log("Connected to host");
        conn.send("join-game");
      });

      conn.on("data", (data) => {
        if (data === "start-game") {
          console.log("Game is starting!");
          setIsGameStarted(true);
        } else if (data.startsWith("countdown:")) {
          const countdownTime = parseInt(data.split(":")[1]);
          setCountdown(countdownTime);
          setMessages((prev) => [
            ...prev,
            `Game starts in: ${countdownTime}`,
          ]);
        } else {
          setMessages((prev) => [...prev, `Opponent: ${data}`]);
        }
      });

      setLobbyIdInput("");
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleCreateLobby = () => {
    if (peer) {
      setIsHost(true);
      console.log("Lobby created with ID:", peer.id);
    }
  };

  function startGameCountdown() {
    let countdownTime = 3;
    setCountdown(countdownTime);
    const countdownInterval = setInterval(() => {
      countdownTime -= 1;
      setCountdown(countdownTime);
      if (peer && connection) {
        connection.send(`countdown:${countdownTime}`);
      }

      if (countdownTime === 0) {
        clearInterval(countdownInterval);
        setCountdown(null); // Hide countdown text after reaching 0
        setIsGameStarted(true);
        connection.send("start-game"); // Notify opponent game has started!!
      }
    }, 1000);
  }

  function playGame() {
    setGameProgress(gameProgress + 1);
    if (gameProgress === gameEnd) {
      gameNotifications.current.innerText = "You've won!";
    } else {
      const newQuestion = generateProblem();
      setQuestion(newQuestion);
      connection.send(`new-question:${newQuestion}`); // Notify opponent abt new Q
    }
  }

  return (
    <div>
      <BackLink />
      <h2>Sign Sprinter</h2>

      {!isGameStarted && !isHost && (
        <div>
          <input
            type="text"
            placeholder="Enter Lobby ID"
            value={lobbyIdInput}
            onChange={(e) => setLobbyIdInput(e.target.value)}
          />
          <button onClick={handleConnect}>Connect to Lobby</button>
        </div>
      )}

      {!isGameStarted && !isHost && (
        <div>
          <button onClick={handleCreateLobby}>Create Lobby</button>
        </div>
      )}

      {isHost && peer && (
        <div>
          <p>Lobby ID: {peer.id}</p>
          <button onClick={startGameCountdown}>Start Game</button>
        </div>
      )}

      {countdown !== null && <h3>Game starts in: {countdown}</h3>}

      {isGameStarted && (
        <div>
          <div ref={gameNotifications}>
            {generateProblemText(question) +
              `\nYou are currently signing ${currentSign}`}
          </div>
          <button onClick={playGame}>Next Question</button>
          <Game
            gameEnd={gameEnd}
            gameProgress={gameProgress}
            messages={messages}
          />

          <Webcam currentSign={currentSign} changeSign={setCurrentSign} />

          {/* Render countdown */}
          <div>
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// import { Outlet, Link, redirect } from "react-router-dom";

// import BackLink from "../components/BackLink";
// import { createLobby } from "../js/lobby.mjs";

// export async function action() {
//   const lobbyId = await createLobby();
//   return redirect(`/play/${lobbyId}`);
// }

// export default function SignSprinter() {
//   return (
//     <div>
//       <div>
//         <h1>Sign Sprinter</h1>
//         <BackLink />
//       </div>
//       <div id="buttons">
//         <Link to={"./join"}>Join Lobby</Link>
//         <Link to={"./create"}>Create Lobby</Link>
//         <Link to={"./browse"}>View Lobbies</Link>
//       </div>
//       <Outlet />
//     </div>
//   );
// }
