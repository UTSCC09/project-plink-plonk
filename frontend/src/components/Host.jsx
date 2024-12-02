import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import { useNavigate } from "react-router-dom";
import { redirect } from "react-router-dom";

import Game from "../components/Game";
import Webcam from "../components/Webcam";
import Chat from "../components/Chat";
import { deleteLobby, closeLobbyVisibility } from "../js/lobby.mjs";

import { generateProblemText, generateProblem } from "../js/problemBank.mjs";

export default function Host({ lobbyId, username }) {
  const RACE_LENGTH = 10; // PLACEHOLDER
  const hostPeer = useRef(null);
  const connections = useRef({});

  let [playerList, setPlayerList] = useState([]);
  let [progressList, setProgressList] = useState([]);

  let [isGameStarted, setIsGameStarted] = useState(false);
  let [messages, setMessages] = useState([]);
  let [inputMessage, setInputMessage] = useState("");
  let [showPopup, setShowPopup] = useState(false);
  let [showReplay, setShowReplay] = useState(false);
  let navigate = useNavigate();

  // Mediapipe
  let [currentSign, setCurrentSign] = useState(null);

  // Game
  let gameText = useRef(null);
  let [gameEnd, setGameEnd] = useState(RACE_LENGTH);
  let [gameProgress, setGameProgress] = useState(-1);
  let [question, setQuestion] = useState(null);
  const [webcamKey, setWebcamKey] = useState(0);
  const [winnerMessage, setWinnerMessage] = useState(null);


  useEffect(() => {
    const RACE_LENGTH = 10; // PLACEHOLDER
    if (!hostPeer.current) {
      hostPeer.current = new Peer(lobbyId);
    }
    const host = hostPeer.current;

    host.on("open", (id) => {
      setPlayerList([{ id, username }]);
      setProgressList([{ id, username, progress: 0 }]);

      // Listen for incoming connections
      host.on("connection", (conn) => {
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
              setTimeout(() => {
                setShowReplay(true);
              }, 2500);
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
                    }
                  }
                });
                return updatedList;
              });
              return updatedProgressList;
            });
          } else if (data.type == "replay") {
            replay();
          } else {
            // data.type == "message"
            setMessages((prev) => {
              const updatedMessages = [...prev, `${data.message}`];

              for (const key in connections.current) {
                const playerConnection = connections.current[key];
                if (playerConnection) {
                  playerConnection.send({
                    type: "message",
                    messages: updatedMessages,
                  });
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
        }
      }
    });

    const gifElement = document.getElementById("game-gif");
    gifElement.style.display = "block"; // Make the GIF visible
    gifElement.src = "";
    setTimeout(() => {
      gifElement.src = "/countdown.gif?" + new Date().getTime();

      setTimeout(() => {
        gifElement.style.display = "none";
        gifElement.src = "";
        setIsGameStarted(true);
        playGame();
      }, 3000);
    }, 1);
  }

  function playGame() {
    setGameProgress(gameProgress + 1);
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
          }
        }
      });
      return updatedList;
    });

    console.log("Game progress is:", gameProgress);
    if (gameProgress === gameEnd) {
      setWinnerMessage(`You won the game!`);
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
      setShowReplay(true);
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

  function replay() {
    setProgressList((prevProgressList) => {
      const updatedProgressList = prevProgressList.map((entry) => ({
        ...entry,
        progress: 0,
      }));

      for (const key in connections.current) {
        const playerConnection = connections.current[key];
        if (playerConnection) {
          playerConnection.send({
            type: "replay",
            progressList: updatedProgressList,
          });
        }
      }
      return updatedProgressList;
    });

    setIsGameStarted(false);
    setMessages([]);
    setCurrentSign(null);
    setGameProgress(0);
    setQuestion(null);
    setShowReplay(false);
    const button = document.getElementById("startButton");
    if (button) {
      button.style.visibility = "visible"; // Show the button
    }
    setWebcamKey((prevKey) => prevKey + 1);
    setWinnerMessage(null);
  }

  return (
    <div>
      <div>
        <button className="absolute top-0 right-0 m-2" onClick={handleLeaveClick} >Go Back</button>
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

      <div className="flex flex-col md:flex-row h-screen">
        <div className="bg-slate-500 w-full md:w-1/4 p-4">
          <h3 className="text-xl font-extrabold md:text-2xl xl:text-3lg">Players in Lobby:</h3>
          <ul>
            {playerList.map((player) => (
              <li key={player.id}>
                Player `{player.username}`
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-600 w-full md:w-1/2 p-4 flex flex-col items-center">
          <div ref={gameText}>
            {winnerMessage
              ? winnerMessage
              : `${generateProblemText(
                  question
                )}\nYou are currently signing ${currentSign}`}
            <img id="trophy-gif" />
          </div>

          <button className="mt-4 w-64" id="startButton" onClick={startGame}>
            Start
          </button>
          <img id="game-gif" />

          {isGameStarted && (
            <Game
              gameEnd={gameEnd}
              gameProgress={gameProgress}
              progressList={progressList}
              username={username}
            />
          )}
        </div>
        
        {/* <Chat /> bonus */}
        <div className="bg-slate-700 w-full h-full md:w-1/4 p-4">
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
