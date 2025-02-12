import { useLoaderData } from "react-router-dom";
import { getCookie, checkAuth } from "../js/authentication.mjs";

import { redirect } from "react-router-dom";

import { checkIsHost } from "../js/lobby.mjs";

import Host from "../components/Host";
import Player from "../components/Player";

const RACE_LENGTH = 10; // PLACEHOLDER

export async function loader({ params }) {
  const { lobbyId } = params;
  let isHost;
  try {
    const logInValue = await checkAuth();
    if (!logInValue) {
      return redirect(`/`);
    }
    isHost = await checkIsHost(lobbyId);
  } catch {
    isHost = false;
  }
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
    <div className="lobby-div text-xl">
      <h2 className="font-display text-4xl font-extrabold md:text-4xl xl:text-5xl mb-10 text-center">
        Sign Sprinter
      </h2>

      {/* Share */}
      <div className="flex absolute top-0 left-0 m-2 text-lg items-center gap-2">
        <p>Share LobbyID with friends:</p>
        <div className="flex items-center gap-1">
          <span>{lobbyId}</span>
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
