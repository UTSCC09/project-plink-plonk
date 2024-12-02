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
  let RACE_LENGTH = 9; // PLACEHOLDER
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
  let [started, setStarted] = useState(false);

  let [question, setQuestion] = useState(null);
  const [webcamKey, setWebcamKey] = useState(0);
  const [winnerMessage, setWinnerMessage] = useState(null);

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
          setWinnerMessage(`Player ${data.username} won the game!`);
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
          setGameProgress(-1);
          setQuestion(null);
          setShowReplay(false);
          setWebcamKey((prevKey) => prevKey + 1);
          setWinnerMessage(null);
          setStarted(false);
          setGameEnd(10);
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
    setGameProgress((prevGameProgress) => {
      const newGameProgress = prevGameProgress + 1;
      let conn = connRef.current;
      conn.send({
        type: "progress-update",
        username: decodeURIComponent(getCookie("nickname")),
        progress: newGameProgress,
      });
  
      // Handle game end and send player-won if progress equals gameEnd
      if (newGameProgress === gameEnd) {
        setWinnerMessage(`You won the game!`);
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
        return newGameProgress;
    });
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
        <button
          className="absolute top-0 right-0 m-2"
          onClick={handleLeaveClick}
        >
          <svg
            width="30px"
            height="30px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 10L3.29289 10.7071L2.58579 10L3.29289 9.29289L4 10ZM21 18C21 18.5523 20.5523 19 20 19C19.4477 19 19 18.5523 19 18L21 18ZM8.29289 15.7071L3.29289 10.7071L4.70711 9.29289L9.70711 14.2929L8.29289 15.7071ZM3.29289 9.29289L8.29289 4.29289L9.70711 5.70711L4.70711 10.7071L3.29289 9.29289ZM4 9L14 9L14 11L4 11L4 9ZM21 16L21 18L19 18L19 16L21 16ZM14 9C17.866 9 21 12.134 21 16L19 16C19 13.2386 16.7614 11 14 11L14 9Z"
              fill="#ecd9d9"
            />
          </svg>
        </button>
        {showReplay && (
          <div className="flex-center">
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

      <div className="flex flex-col md:flex-row h-screen">
        <div className="w-full md:w-1/4 p-4 ">
          <h3 className="text-xl font-extrabold md:text-2xl xl:text-3lg">
            Players in Lobby:
          </h3>
          <ul>
            {playerList.map((player) => (
              <li key={player.id}>Player {player.username}</li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-1/2 p-4 flex flex-col items-center min-w-[500px]">
          <div ref={gameText}>
            {winnerMessage
              ? winnerMessage
              : `${generateProblemText(
                  question
                )}\nYou are currently signing ${currentSign}`}
            <img id="trophy-gif" />
          </div>
          {!isGameStarted ? (
            <p>Waiting for host to start game..</p>
          ) : (
            <div></div>
          )}

          <button className="invisible m-4 w-64"></button>
          <img id="game-gif" />

          {isGameStarted && (
            <Game
              gameEnd={10}
              gameProgress={gameProgress}
              progressList={progressList}
              username={username}
            />
          )}
        </div>

        {/* <Chat /> bonus */}
        <div className="w-full h-full md:w-1/4 p-4 min-w-[300px]">
          <Chat
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            sendMessage={sendMessage}
          />
        </div>

        <div className="fixed bottom-0 left-0 m-4">
          <Webcam currentSign={currentSign} changeSign={setCurrentSign} />
        </div>
      </div>
    </div>
  );
}
