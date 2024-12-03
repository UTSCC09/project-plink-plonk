import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import { useNavigate } from "react-router-dom";

import Game from "../components/Game";
import Webcam from "../components/Webcam";
import Chat from "../components/Chat";
import PlayersInLobby from "../components/PlayersInLobby";
import BackLobby from "../components/BackLobby";

import { deleteLobby, closeLobbyVisibility } from "../js/lobby.mjs";
import { generateProblemText, generateProblem } from "../js/problemBank.mjs";

export default function Host({ lobbyId, username }) {
  let RACE_LENGTH = 10; // PLACEHOLDER
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
  let [started, setStarted] = useState(false);
  let [question, setQuestion] = useState(null);
  const [webcamKey, setWebcamKey] = useState(0);
  const [winnerMessage, setWinnerMessage] = useState(null);

  useEffect(() => {
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
          if (data.type === "join-game") {
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
            setWinnerMessage(`Player ${data.username} won the game!`);
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
    setGameProgress((prevGameProgress) => {
      const newGameProgress = prevGameProgress + 1;
  
      setProgressList((prevProgressList) => {
        let user = prevProgressList.find((user) => user.username === username);
        if (user) {
          user.progress = newGameProgress;
        }
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
  
      if (newGameProgress === gameEnd) {
        setWinnerMessage(`You won the game!`);
        const gifElement = document.getElementById("game-gif");
        gifElement.style.display = "block"; // Make the GIF visible
        gifElement.src = "/trophy.gif";
        gifElement.style.display = "block";
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
        let newQuestion = generateProblem();
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
    setGameProgress(-1);
    setQuestion(null);
    setShowReplay(false);
    setStarted(false);
    const button = document.getElementById("startButton");
    if (button) {
      button.style.visibility = "visible"; // Show the button
    }
    setWebcamKey((prevKey) => prevKey + 1);
    setWinnerMessage(null);
  }

  return (
    <div>
      <BackLobby
        handleLeaveClick={handleLeaveClick}
        showPopup={showPopup}
        confirmLeave={confirmLeave}
        cancelLeave={cancelLeave}
        showReplay={showReplay}
        replay={replay}
      />

      <div className="flex flex-col md:flex-row h-screen">
        <PlayersInLobby playerList={playerList} />

        <div className="w-full md:w-1/2 p-4 flex flex-col items-center min-w-[500px]">
          <div ref={gameText}>
            {winnerMessage
              ? winnerMessage
              : `${generateProblemText(
                  question
                )}\nYou are currently signing ${currentSign}`}
          </div>

          <button className="mt-4 w-64" id="startButton" onClick={startGame}>
            Start
          </button>

          {isGameStarted && (
            <Game
              gameEnd={10}
              gameProgress={gameProgress}
              progressList={progressList}
              username={username}
            />
          )}
          <img id="game-gif" />
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
