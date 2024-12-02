import { useState, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getCookie } from "../js/authentication.mjs";

import { redirect } from "react-router-dom";

import {
  checkIsHost,
  checkAuth,
} from "../js/lobby.mjs";

import Host from "../components/Host";
import Player from "../components/Player";

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

  return (
    <div>
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
      </div>
      <div>
        {isHost ? (
          <Host lobbyId={lobbyId} username={username} />
        ) : (
          <Player lobbyId={lobbyId} username={username} />
        )}
      </div>
    </div>
  );
}
