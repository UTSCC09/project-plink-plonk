import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Peer from "peerjs";
import { useParams, useLoaderData, useLocation } from "react-router-dom";

import BackLink from "../components/BackLink";
import Game from "../components/Game";
import Webcam from "../components/Webcam";
import { deleteLobby, closeLobbyVisibility, checkIsHost } from "../js/lobby.mjs";

import { generateProblemText, generateProblem } from "../js/problemBank.mjs";

const RACE_LENGTH = 10; // PLACEHOLDER

export async function loader({ params }) {
  const { lobbyId } = params;
  let isHost;
  try{
    isHost = await checkIsHost(lobbyId);
  }
  catch{
    isHost = false;
  }
  console.log("Host value is..:");
  console.log(isHost);
  const username = getCookie("username");
  return { lobbyId, username, isHost };
}

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export default function Lobby({ hasWebcam = true }) {
  const { lobbyId, username, isHost } = useLoaderData();

  // PeerJS
  const hostPeer = useRef(null);
  const playerRef = useRef(null);
  const connRef = useRef(null);

  //const [connection, setConnection] = useState(null);
  const connections = useRef({});

  // let isHost = false;
  // if (getCookie("isHost") == "True") {
  //   isHost = true;
  // }

  // console.log("isHost value:");
  // console.log(isHost);

  const [playerList, setPlayerList] = useState([]);
  const [progressList, setProgressList] = useState([]);

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [messages, setMessages] = useState([0]);

  // Mediapipe
  const [currentSign, setCurrentSign] = useState(null);

  // Game
  const gameText = useRef(null);
  const [gameEnd, setGameEnd] = useState(RACE_LENGTH);
  const [gameProgress, setGameProgress] = useState(0);
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
            } else {
              setMessages((prev) => [...prev, `Opponent: ${data}`]);
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
        const conn = player.connect(lobbyId);
        if (!connRef.current) {
          connRef.current = conn;
        }
        //setConnection(conn);

        conn.on("open", () => {
          console.log("Connected to host with Guest Peer ID:", player.id);
          conn.send({ type: "join-game", username: getCookie("username") });
          console.log("Sent data..");
        });

        conn.on("data", (data) => {
          if (data.type === "player-list") {
            console.log("Got data, type is player-list");
            setPlayerList(data.playerList);
          } else if (data.type == "progress-update") {
            setProgressList(data.progressList);
            console.log("Got updated progress List");
          } else if (data === "start-game") {
            console.log("Game is starting!");
            setIsGameStarted(true);
          } else if (data === "send-message") {
            setMessages((prev) => [...prev, `Opponent: ${data}`]);
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

  function sendProgress(message) {
    if (connection && connection.open) {
      connection.send(message);
      setMessages([message]);
    }
  }
  function startGame(e) {
    e.target.style.visibility = "hidden";
    closeLobbyVisibility(lobbyId);
    playGame();
  }

  function playGame() {
    setGameProgress(gameProgress + 1);
    console.log("Moved to: " + gameProgress);

    if (!isHost) {
      let conn = connRef.current;
      conn.send({
        type: "progress-update",
        username: getCookie("username"),
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
    navigator.clipboard.writeText(lobbyId).then(
      () => {
        alert("Lobby ID copied to clipboard!");
      },
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
  }

  return (
    <div>
      <BackLink />
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
          </div>
          <button onClick={startGame}>Start</button>
        </div>
        <Game
          gameEnd={gameEnd}
          gameProgress={gameProgress}
          progressList={progressList}
          username={username}
        />
        <Webcam currentSign={currentSign} changeSign={setCurrentSign} />
        {/* <PlayerList /> this isn't setup*/}
        {/* <Chat /> bonus */}
      </div>
    </div>
  );
}
