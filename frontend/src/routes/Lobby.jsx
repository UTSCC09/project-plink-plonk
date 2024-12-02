import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import { getCookie, checkAuth } from "../js/authentication.mjs";

import { Outlet, Link, redirect } from "react-router-dom";

import BackLink from "../components/BackLink";
import Game from "../components/Game";
import Webcam from "../components/Webcam";
import {
  deleteLobby,
  closeLobbyVisibility,
  checkIsHost
} from "../js/lobby.mjs";

import { generateProblemText, generateProblem } from "../js/problemBank.mjs";

const RACE_LENGTH = 10; // PLACEHOLDER

export async function loader({ params }) {
  const { lobbyId } = params;
  let isHost;
  try {
    const logInValue = await checkAuth();
    console.log("We have login value:,", logInValue);
    if (!logInValue) {
      return redirect(`/`);
    }
    isHost = await checkIsHost(lobbyId);
  } catch {
    isHost = false;
  }
  console.log("Host value is..:");
  console.log(isHost);
  const username = decodeURIComponent(getCookie("nickname"));
  return { lobbyId, username, isHost };
}

export default function Lobby({ hasWebcam = true }) {
  const { lobbyId, username, isHost } = useLoaderData();

  // PeerJS

  // Host
  const hostPeer = useRef(null);
  const connections = useRef({});

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

  // PeerJS + check Host
  useEffect(() => {
    if (isHost) {
      console.log("Yay! I'm the host");
      if (!hostPeer.current) {
        console.log("Creating host Peer");
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
              // Update PlayerList, Progress List, Connections list. Send to everyone updated Player List and Progess list
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
    } else {
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
          conn.send({ type: "join-game", username: decodeURIComponent(getCookie("nickname")) });
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
    }
    return () => {
      if (hostPeer.current && hostPeer.current.open) {
        console.log("Destroying peer connection");
        document.cookie = `isHost=; max-age=0; path=/;`;
        hostPeer.current.destroy();
        deleteLobby(lobbyId);
      }

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

      if (isHost) {
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
      }
    };

    window.addEventListener("beforeunload", cleanUpPeer);
    window.addEventListener("unload", cleanUpPeer); // Fallback for browsers that support it

    return () => {
      window.removeEventListener("beforeunload", cleanUpPeer);
      window.removeEventListener("unload", cleanUpPeer);
    };
  }, []);

  function sendProgress(message) {
    if (connection && connection.open) {
      connection.send(message);
      setMessages([message]);
    }
  }
  function startGame(e) {
    e.target.style.visibility = "hidden";
    closeLobbyVisibility(lobbyId);
    if (isHost) {
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
    }
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

    if (!isHost) {
      let conn = connRef.current;
      conn.send({
        type: "progress-update",
        username: decodeURIComponent(getCookie("nickname")),
        progress: gameProgress,
      });
    }

    // Host updates their progress to others
    if (isHost) {
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
    }

    if (gameProgress === gameEnd) {
      gameText.current.innerText = "You've won!";
      const gifElement = document.getElementById("game-gif");
      gifElement.style.display = "block"; // Make the GIF visible
      gifElement.src = "/trophy.gif";
      setTimeout(() => {
        gifElement.style.display = "none";
        gifElement.src = "";
      }, 1000);

      if (!isHost) {
        connRef.current.send({
          type: "player-won",
          username: username,
          playerId: playerId,
        });
      }
      if (isHost) {
        for (const key in connections.current) {
          const playerConnection = connections.current[key];
          if (playerConnection) {
            playerConnection.send({
              type: "player-won",
              username: username,
            });
          }
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

  function copyToClipboard(lobbyId) {
    navigator.clipboard
      .writeText(lobbyId)
      .then(() => {
        const notification = document.createElement("div");
        notification.textContent = "Lobby ID copied!";
        notification.classList.add("notification");
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.remove();
        }, 1000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }

  function sendMessage() {
    if (!inputMessage.trim()) return;
    const message = `${username}: ${inputMessage}`;
    if (isHost) {
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
    } else {
      // Send from guest to host
      connRef.current.send({ type: "message", message: message });
      console.log("sent message..");
    }
    setInputMessage("");
  }

  function handleLeaveClick() {
    setShowPopup(true);
  }

  function confirmLeave() {
    if (!isHost) {
      connRef.current.send({
        type: "leaving",
        username: username,
        playerId: playerId,
      });
    }
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    if (isHost) {
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
        <h2>Sign Sprinter</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 style={{ marginRight: "10px" }}>
            Share LobbyID with friends: {lobbyId}
          </h2>
          <img
            src="/copy.png"
            alt="Copy"
            onClick={() => copyToClipboard(lobbyId)}
            style={{
              width: "24px",
              height: "24px",
              cursor: "pointer",
            }}
          />
        </div>

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

          {isHost ? (
            <button onClick={startGame}>Start</button>
          ) : !isGameStarted ? (
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