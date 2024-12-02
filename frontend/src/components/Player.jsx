import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import {  useNavigate } from "react-router-dom";
import { getCookie } from "../js/authentication.mjs";

import { redirect } from "react-router-dom";

import Game from "../components/Game";
import Webcam from "../components/Webcam";

import { generateProblemText, generateProblem } from "../js/problemBank.mjs";

export default function Player({ lobbyId, username }) {
  const RACE_LENGTH = 10; // PLACEHOLDER
  // Guest player
  const playerRef = useRef(null);
  const playerId = useRef(null);
  const connRef = useRef(null);
  const [hostLeaving, setHostLeaving] = useState(false);

  const [playerList, setPlayerList] = useState([]);
  const [progressList, setProgressList] = useState([]);

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Mediapipe
  const [currentSign, setCurrentSign] = useState(null);

  // Game
  const gameText = useRef(null);
  const [gameEnd, setGameEnd] = useState(RACE_LENGTH);
  const [gameProgress, setGameProgress] = useState(-1);
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    console.log("I'm a guest. let's set up a PeerJs connection to host");
    if (!playerRef.current) {
      playerRef.current = new Peer();
    }
    const player = playerRef.current;

    player.on("open", () => {
      console.log("Guest Peer ID:", player.id);
      playerId.current = player.id;
      const conn = player.connect(lobbyId);
      if (!connRef.current) {
        connRef.current = conn;
      }
      //setConnection(conn);

      conn.on("open", () => {
        console.log("Connected to host with Guest Peer ID:", player.id);
        conn.send({
          type: "join-game",
          username: decodeURIComponent(getCookie("nickname")),
        });
        console.log("Sent data..");
      });

      conn.on("data", (data) => {
        if (data.type == "player-list") {
          console.log("Got data, type is player-list");
          setPlayerList(data.playerList);
        } else if (data.type == "progress-update") {
          setProgressList(data.progressList);
          console.log("Got updated progress List");
        } else if (data.type == "start-game") {
          console.log("Game is starting!");
          const gifElement = document.getElementById("game-gif");
          gifElement.style.display = "block"; // Make the GIF visible
          gifElement.src = "/countdown.gif";
          setTimeout(() => {
            gifElement.style.display = "none";
            gifElement.src = "";
            setIsGameStarted(true);
            playGame();
          }, 3000);
        } else if (data.type == "message") {
          console.log("received message list update");
          setMessages(data.messages);
        } else if (data.type == "player-won") {
          gameText.current.innerText = `Player ${data.username} won the game!`;
        } else if (data.type == "leaving") {
          setPlayerList(data.playerList);
          setProgressList(data.progressList);
        } else if (data.type == "host-leaving") {
          setHostLeaving(true);
          playerRef.current.destroy();
          setTimeout(() => {
            navigate("..");
          }, 1300);
        } else {
          console.log("Received message:", data);
        }
      });
    });

    return () => {
      if (playerRef.current && playerRef.current.open) {
        console.log("Destroying guest peer connection");
        playerRef.current.destroy();
      }
    };
  }, []);

  // Progresses game if sign on camera matches question
  useEffect(() => {
    if (question && currentSign && currentSign === question.label) {
      console.log(
        `Question is ${question.label}, sign is ${currentSign}, so we move`
      );
      playGame();
    }
  }, [currentSign]);

  useEffect(() => {
    const cleanUpPeer = () => {
      if (playerRef.current) {
        connRef.current.send({
          type: "leaving",
          username: username,
          playerId: playerId,
        });
        playerRef.current.destroy();
      }
    };

    window.addEventListener("beforeunload", cleanUpPeer);
    window.addEventListener("unload", cleanUpPeer); // Fallback for browsers that support it

    return () => {
      window.removeEventListener("beforeunload", cleanUpPeer);
      window.removeEventListener("unload", cleanUpPeer);
    };
  }, []);

  function playGame() {
    setGameProgress(gameProgress + 1);
    console.log("Moved to: " + gameProgress);

    let conn = connRef.current;
    conn.send({
      type: "progress-update",
      username: decodeURIComponent(getCookie("nickname")),
      progress: gameProgress,
    });

    if (gameProgress === gameEnd) {
      gameText.current.innerText = "You've won!";
      const gifElement = document.getElementById("game-gif");
      gifElement.style.display = "block"; // Make the GIF visible
      gifElement.src = "/trophy.gif";
      setTimeout(() => {
        gifElement.style.display = "none";
        gifElement.src = "";
      }, 1000);

      connRef.current.send({
        type: "player-won",
        username: username,
        playerId: playerId,
      });
    } else {
      // Create next question
      let newQuestion = generateProblem();
      // Avoid repeat of current question
      while (newQuestion === question) {
        newQuestion = generateProblem();
      }
      setQuestion(newQuestion);
    }
  }

  function sendMessage() {
    if (!inputMessage.trim()) return;
    const message = `${username}: ${inputMessage}`;

    connRef.current.send({ type: "message", message: message });
    console.log("sent message..");
    setInputMessage("");
  }

  function handleLeaveClick() {
    setShowPopup(true);
  }

  function confirmLeave() {
    connRef.current.send({
      type: "leaving",
      username: username,
      playerId: playerId,
    });
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    navigate("..");
  }

  function cancelLeave() {
    setShowPopup(false);
  }

  return (
    <div>
      <div>
        <button onClick={handleLeaveClick}>[Back Icon]</button>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup2">
              <p>Are you sure you want to leave the game?</p>
              <button id="leave" onClick={confirmLeave}>
                Yes
              </button>
              <button id="stay" onClick={cancelLeave}>
                I'll Stay
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        {hostLeaving && (
          <div className="popup2">Sorry, the host is destroying this game.</div>
        )}
      </div>

      <div>
        {/* Player List */}
        <div>
          <h3>Players in Lobby:</h3>
          <ul>
            {playerList.map((player) => (
              <li key={player.id}>
                Player `{player.username}` with ID: {player.id}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div ref={gameText}>
            {generateProblemText(question) +
              `\nYou are currently signing ${currentSign}`}
            <img id="trophy-gif" />
          </div>

          {!isGameStarted ? (
            <p>Waiting for host to start game..</p>
          ) : (
            <div></div>
          )}
          <img id="game-gif" />
        </div>

        {isGameStarted && (
          <div>
            <Game
              gameEnd={gameEnd}
              gameProgress={gameProgress}
              progressList={progressList}
              username={username}
            />
          </div>
        )}
        <Webcam currentSign={currentSign} changeSign={setCurrentSign} />
        {/* <Chat /> bonus */}
        <div>
          <h2>Lobby Chat</h2>
          <div id="lobby-chat">
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
          <input
            id="chat-input"
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
