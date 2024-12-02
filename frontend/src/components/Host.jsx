import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../js/authentication.mjs";

import { redirect } from "react-router-dom";

import Game from "../components/Game";
import Webcam from "../components/Webcam";
import { deleteLobby, closeLobbyVisibility } from "../js/lobby.mjs";

import { generateProblemText, generateProblem } from "../js/problemBank.mjs";

export default function Host({ lobbyId, username }) {
  const RACE_LENGTH = 10; // PLACEHOLDER
  const hostPeer = useRef(null);
  const connections = useRef({});

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
    const RACE_LENGTH = 10; // PLACEHOLDER
    if (!hostPeer.current) {
      hostPeer.current = new Peer(lobbyId);
    }
    const host = hostPeer.current;

    host.on("open", (id) => {
      console.log("Connected with ID:", id);
      setPlayerList([{ id, username }]);

      setProgressList([{ id, username, progress: 0 }]);

      // Listen for incoming connections
      host.on("connection", (conn) => {
        console.log("Player joined the game:", conn.peer);

        conn.on("data", (data) => {
          console.log("Data received by host:", data);
          if (data.type === "join-game") {
            console.log("Player ready to start the game");

            setPlayerList((prevPlayerList) => {
              const isAlreadyInList = prevPlayerList.some(
                (player) => player.id === conn.peer
              );

              let updatedList = prevPlayerList;

              if (!isAlreadyInList) {
                updatedList = [
                  ...prevPlayerList,
                  { id: conn.peer, username: data.username },
                ];
              }

              connections.current[conn.peer] = conn;

              // Send the updated list to everyone except the first person
              updatedList.forEach((player, index) => {
                if (index !== 0) {
                  const playerConnection = connections.current[player.id];
                  if (playerConnection) {
                    playerConnection.send({
                      type: "player-list",
                      playerList: updatedList,
                    });
                    console.log("sending list to player");
                  }
                }
              });
              return updatedList;
            });

            setProgressList((prevProgressList) => {
              const isAlreadyInList = prevProgressList.some(
                (player) => player.id === conn.peer
              );

              let updatedList = prevProgressList;

              if (!isAlreadyInList) {
                updatedList = [
                  ...prevProgressList,
                  { id: conn.peer, username: data.username, progress: 0 },
                ];
              }

              // Send the updated list to everyone except the first person
              updatedList.forEach((player, index) => {
                if (index !== 0) {
                  const playerConnection = connections.current[player.id];
                  if (playerConnection) {
                    playerConnection.send({
                      type: "progress-update",
                      progressList: updatedList,
                    });
                    console.log("Sending progress list to player");
                  }
                }
              });
              return updatedList;
            });
          } else if (data.type == "progress-update") {
            // Host gets an update from a player and sends it to everyone
            setProgressList((prevProgressList) => {
              let user = prevProgressList.find(
                (user) => user.username == data.username
              );
              user.progress = data.progress;
              const updatedList = [...prevProgressList];

              prevProgressList.forEach((player, index) => {
                if (index !== 0) {
                  const playerConnection = connections.current[player.id];
                  if (playerConnection) {
                    playerConnection.send({
                      type: "progress-update",
                      progressList: updatedList,
                    });
                    console.log("Sending progress list to player!!");
                  }
                }
              });
              return updatedList;
            });
          } else if (data.type == "player-won") {
            for (const key in connections.current) {
              const playerConnection = connections.current[key];
              if (playerConnection && key != data.playerId) {
                playerConnection.send({
                  type: "player-won",
                  username: data.username,
                });
              }
            }

            gameText.current.innerText = `Player ${data.username} won the game!`;
          } else if (data.type == "leaving") {
            setProgressList((prevProgressList) => {
              const updatedProgressList = prevProgressList.filter(
                (player) => player.username !== data.username
              );

              delete connections.current[data.playerId];

              setPlayerList((prevPlayerList) => {
                const updatedList = prevPlayerList.filter(
                  (player) => player.username !== data.username
                );

                // Send the updated list to everyone except the first person
                updatedList.forEach((player, index) => {
                  if (index !== 0 && player.id !== data.playerId) {
                    const playerConnection = connections.current[player.id];
                    if (playerConnection) {
                      playerConnection.send({
                        type: "leaving",
                        playerList: updatedList,
                        progressList: updatedProgressList,
                      });
                      console.log(
                        "sending updated lists except to the one that left"
                      );
                    }
                  }
                });
                return updatedList;
              });
              return updatedProgressList;
            });
          } else {
            // data.type == "message"
            console.log("Got somebody's message");

            setMessages((prev) => {
              const updatedMessages = [...prev, `${data.message}`];

              for (const key in connections.current) {
                const playerConnection = connections.current[key];
                if (playerConnection) {
                  playerConnection.send({
                    type: "message",
                    messages: updatedMessages,
                  });
                  console.log("Sending updated messages to connection:", key);
                }
              }
              return updatedMessages;
            });
          }
        });
      });
    });

    return () => {
      if (hostPeer.current && hostPeer.current.open) {
        console.log("Destroying peer connection");
        document.cookie = `isHost=; max-age=0; path=/;`;
        hostPeer.current.destroy();
        deleteLobby(lobbyId);
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
      for (const key in connections.current) {
        const playerConnection = connections.current[key];
        if (playerConnection) {
          playerConnection.send({
            type: "host-leaving",
          });
        }
      }
      deleteLobby(lobbyId);
      hostPeer.current.destroy();
    };

    window.addEventListener("beforeunload", cleanUpPeer);
    window.addEventListener("unload", cleanUpPeer); // Fallback for browsers that support it

    return () => {
      window.removeEventListener("beforeunload", cleanUpPeer);
      window.removeEventListener("unload", cleanUpPeer);
    };
  }, []);

  function startGame(e) {
    e.target.style.visibility = "hidden";
    closeLobbyVisibility(lobbyId);
    playerList.forEach((player, index) => {
      if (index !== 0) {
        const playerConnection = connections.current[player.id];
        if (playerConnection) {
          playerConnection.send({
            type: "start-game",
          });
          console.log("Telling players the game is starting");
        }
      }
    });

    const gifElement = document.getElementById("game-gif");
    gifElement.style.display = "block"; // Make the GIF visible
    gifElement.src = "/countdown.gif";
    setTimeout(() => {
      gifElement.style.display = "block";
      gifElement.src = "/countdown.gif?" + new Date().getTime();

      setTimeout(() => {
        gifElement.style.display = "none";
        gifElement.src = "";
        setIsGameStarted(true);
        playGame();
      }, 3000);
    }, 1); // slight offset so everybody starts the same time LOL
  }

  function playGame() {
    setGameProgress(gameProgress + 1);
    console.log("Moved to: " + gameProgress);

    // Host updates their progress to others
    setProgressList((prevProgressList) => {
      let user = prevProgressList.find((user) => user.username == username);
      user.progress = gameProgress;
      const updatedList = [...prevProgressList];

      prevProgressList.forEach((player, index) => {
        if (index !== 0) {
          const playerConnection = connections.current[player.id];
          if (playerConnection) {
            playerConnection.send({
              type: "progress-update",
              progressList: updatedList,
            });
            console.log("Sending progress list to player!!");
          }
        }
      });
      return updatedList;
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

      for (const key in connections.current) {
        const playerConnection = connections.current[key];
        if (playerConnection) {
          playerConnection.send({
            type: "player-won",
            username: username,
          });
        }
      }
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
    setMessages((prev) => {
      const updatedMessages = [...prev, `${username}: ${inputMessage}`];
      playerList.forEach((player, index) => {
        if (index !== 0) {
          const playerConnection = connections.current[player.id];
          if (playerConnection) {
            playerConnection.send({
              type: "message",
              messages: updatedMessages,
            });
          }
        }
      });
      return updatedMessages;
    });

    setInputMessage("");
  }

  function handleLeaveClick() {
    setShowPopup(true);
  }

  function confirmLeave() {
    for (const key in connections.current) {
      const playerConnection = connections.current[key];
      if (playerConnection) {
        playerConnection.send({
          type: "host-leaving",
        });
      }
    }
    deleteLobby(lobbyId);
    hostPeer.current.destroy();
    navigate("..");
  }

  function cancelLeave() {
    setShowPopup(false);
  }

  return (
    <div>
      <div>
        <button onClick={handleLeaveClick}>Go Back</button>
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

          <button onClick={startGame}>Start</button>
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
