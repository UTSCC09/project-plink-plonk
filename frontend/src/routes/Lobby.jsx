import { useState, useEffect, useRef} from "react";
import { Link } from "react-router-dom";
import Peer from "peerjs";

import BackLink from "../components/BackLink";
import Game from "../components/Game";
import Webcam from "../components/Webcam";

import { getLobby } from "../js/lobby.mjs";
import { generateProblemText, generateProblem } from "../js/problemBank.mjs"

const RACE_LENGTH = 5; // PLACEHOLDER

export async function loader({ params }) {
  const lobbyDetails = await getLobby(params.lobbyId);
  return { lobbyDetails };
}

export default function Lobby({ lobbyDetails, hasWebcam = true }) {
  // PeerJS 
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isHost, setIsHost] = useState(false); // need to configure backend to recognize host
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [messages, setMessages] = useState([0]);

  // Mediapipe
  const [currentSign, setCurrentSign] = useState(null);

  // Game
  const gameNotifications = useRef(null);
  const [gameEnd, setGameEnd] = useState(RACE_LENGTH);
  const [gameProgress, setGameProgress] = useState(0);
  const [question, setQuestion] = useState(null);
  
  // PeerJS
  useEffect(() => {
    // placeholder: try joining game first
    console.log(lobbyDetails.lobbyId);
    try{
      const connection = peer.connect(lobbyDetails.lobbyId);
    } catch(e) { console.error(e); }

    // Creating instance
    const newPeer = new Peer(lobbyDetails);
    setPeer(newPeer);

    // Try joining 

    // Setting up peer ID once peer's initialized
    newPeer.on("open", (id) => {
      console.log("Connected with ID:", id);
      setLobbyId(id); // Use as lobby/game ID
    });

    // Listen for incoming connections
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

    return () => {
      newPeer.destroy();
    }
  }, []);

  // const conn = peer.connect(lobbyId);
  //   setConnection(conn);

  // conn.on("open", () => {
  //   console.log("Connected to host");
  //   conn.send("join-game"); // Notify host we wanna join
  // });

  // conn.on("data", (data) => {
  //   if (data === "start-game") {
  //     console.log("Game is starting!");
  //     setIsGameStarted(true);
  //   } else {
  //     setMessages((prev) => [...prev, `Opponent: ${data}`]);
  //   }
  // });

  // function sendProgress(message) {
  //   if (connection && connection.open) {
  //     connection.send(message);
  //     setMessages([message]);
  //   }
  // }

  function startGame(e) {
    e.target.style.visibility = "hidden";
    playGame();
  }

  function playGame() {
    console.log(gameProgress);
    setGameProgress(gameProgress + 1);
    if (gameProgress === gameEnd) {
      gameNotifications.current.innerText = "You've won!"
    } else {
      setQuestion(generateProblem());
    }
  }

  return (
    <div>
      <BackLink />
      <div>
        <h2>Sign Sprinter</h2>
        <div>
          <div ref={gameNotifications}>
            {generateProblemText(question) + `\nYou are currently signing ${currentSign}`}
            </div>
          <button onClick={startGame}>Start</button>
        </div>
        <Game
          gameEnd={gameEnd}
          gameProgress={gameProgress}
          messages={messages}
        />
        <Webcam
          currentSign={currentSign}
          changeSign={setCurrentSign}
        />
        {/* <PlayerList /> this isn't setup*/}
        {/* <Chat /> bonus */}
      </div>
    </div>
  );
}
