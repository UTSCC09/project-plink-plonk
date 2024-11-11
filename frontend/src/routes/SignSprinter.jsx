import { Outlet, Link, redirect } from "react-router-dom";

import BackLink from "../components/BackLink";
import { createLobby } from "../js/lobby.mjs";

export async function action() {
  const lobbyId = await createLobby();
  return redirect(`/play/${lobbyId}`);
}

export default function SignSprinter() {
  return (
    <div>
      <div>
        <h1>Sign Sprinter</h1>
        <BackLink />
      </div>
      <div id="buttons">
        <Link to={"./join"}>Join Lobby</Link>
        <Link to={"./create"}>Create Lobby</Link>
        <Link to={"./browse"}>View Lobbies</Link>
      </div>
      <Outlet />
    </div>
  );
}
