import { useState, useEffect, useRef} from "react";
import { Link } from "react-router-dom";
import Peer from "peerjs";

import BackLink from "../components/BackLink";
import Game from "../components/Game";
import Webcam from "../components/Webcam";

import { getLobby } from "../js/lobby.mjs";
import { generateProblemText, generateProblem } from "../js/problemBank.mjs"

const RACE_LENGTH = 3; // PLACEHOLDER

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
  const gameText = useRef(null);
  const [gameEnd, setGameEnd] = useState(RACE_LENGTH);
  const [gameProgress, setGameProgress] = useState(0);
  const [question, setQuestion] = useState(null);
  
  // Progresses game if sign on camera matches question
  useEffect(() => {
    if (question && currentSign && currentSign === question.label) {
      console.log(`Question is ${question.label}, sign is ${currentSign}, so we move`)
      playGame();
    }
  }, [currentSign]);

  function startGame(e) {
    e.target.style.visibility = "hidden";
    playGame();
  }

  function playGame() {
    setGameProgress(gameProgress + 1);
    console.log("Moved to: " + gameProgress);
    if (gameProgress === gameEnd) {
      gameText.current.innerText = "You've won!"
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

  return (
    <div>
      <BackLink />
      <div>
        <h2>Sign Sprinter</h2>
        <div>
          <div ref={gameText}>
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
