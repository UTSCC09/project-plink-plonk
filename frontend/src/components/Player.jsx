import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../js/authentication.mjs";

import { redirect } from "react-router-dom";

import Game from "../components/Game";
import Webcam from "../components/Webcam";
import Chat from "../components/Chat";

import { generateProblemText, generateProblem } from "../js/problemBank.mjs";

export default function Player({ lobbyId, username }) {
  const RACE_LENGTH = 10; // PLACEHOLDER
  // Guest player
  const playerRef = useRef(null);
  const playerId = useRef(null);
  const connRef = useRef(null);
  const [hostLeaving, setHostLeaving] = useState(false);

  let [playerList, setPlayerList] = useState([]);
  let [progressList, setProgressList] = useState([]);

  let [isGameStarted, setIsGameStarted] = useState(false);
  let [messages, setMessages] = useState([]);
  let [inputMessage, setInputMessage] = useState("");
  let [showPopup, setShowPopup] = useState(false);
  let [showReplay, setShowReplay] = useState(false);
  const navigate = useNavigate();

  // Mediapipe
  let [currentSign, setCurrentSign] = useState(null);

  // Game
  let gameText = useRef(null);
  let [gameEnd, setGameEnd] = useState(RACE_LENGTH);
  let [gameProgress, setGameProgress] = useState(-1);
  let [question, setQuestion] = useState(null);

  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = new Peer();
    }
    const player = playerRef.current;

    player.on("open", () => {
      playerId.current = player.id;
      const conn = player.connect(lobbyId);
      if (!connRef.current) {
        connRef.current = conn;
      }
      conn.on("open", () => {
        conn.send({
          type: "join-game",
          username: decodeURIComponent(getCookie("nickname")),
        });
      });

      conn.on("data", (data) => {
        if (data.type == "player-list") {
          setPlayerList(data.playerList);
        } else if (data.type == "progress-update") {
          setProgressList(data.progressList);
        } else if (data.type == "start-game") {
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
          setMessages(data.messages);
        } else if (data.type == "player-won") {
          gameText.current.innerText = `Player ${data.username} won the game!`;
          setTimeout(() => {
            setShowReplay(true);
          }, 2800);
        } else if (data.type == "leaving") {
          setPlayerList(data.playerList);
          setProgressList(data.progressList);
        } else if (data.type == "host-leaving") {
          setHostLeaving(true);
          playerRef.current.destroy();
          setTimeout(() => {
            navigate("..");
          }, 1300);
        } else if (data.type == "replay") {
          setProgressList(data.progressList);
          setIsGameStarted(false);
          setMessages([]);
          setCurrentSign(null);
          gameText.current.innerText = `${generateProblemText(question) + `\nYou are currently signing ${currentSign}`}`;
          setGameProgress(-1);
          setQuestion(null);
          setShowReplay(false);
        } else {
          console.log("Received message:", data);
        }
      });
    });

    return () => {
      if (playerRef.current && playerRef.current.open) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Progresses game if sign on camera matches question
  useEffect(() => {
    if (question && currentSign && currentSign === question.label) {
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

  function replay() {
    connRef.current.send({
      type: "replay",
    });
  }

  return (
    <div>
      <div>
        <button onClick={handleLeaveClick}>[Back Icon]</button>
        {showReplay && (
          <div className="popup2">
            <button id="replay" onClick={replay}>
              Replay game
            </button>
          </div>
        )}
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
        <div>
          <h3>Players in Lobby:</h3>
          <ul>
            {playerList.map((player) => (
              <li key={player.id}>Player `{player.username}`</li>
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
        <Chat
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}