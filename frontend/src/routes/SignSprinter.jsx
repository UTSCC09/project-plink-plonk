import { Outlet, Link, redirect } from "react-router-dom";
import { useState, useEffect } from "react";
import Peer from "peerjs";
import BackLink from "../components/BackLink";
import { createLobby } from "../js/lobby.mjs";
import { checkAuth } from "../js/lobby.mjs";

export async function action({ request }) {
  // Parse form data
  const formData = await request.formData();
  const name = formData.get("name");
  const visibility = formData.get("visibility");

  try {
    const lobbyId = await createLobby(name, visibility);

    // Redirect to the newly created lobby
    return redirect(`/play/${lobbyId}`); 
  } catch (error) {
    console.error("Error creating lobby:", error);
    return redirect(`/`);
  }
}

export default function SignSprinter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkAuthStatus = async () => {
      const logInValue = await checkAuth();  
      console.log("here");
      console.log(logInValue)
      setIsLoggedIn(logInValue);   
    };
    checkAuthStatus();   
  }, []);

  return (
    <div>
      <div>
        <h1 class="font-display text-4xl font-extrabold sm:text-5xl md:text-6xl xl:text-6.5xl">Sign Sprinter</h1>
        <BackLink />
      </div>
      {isLoggedIn && (
        <div id="buttons">
          <Link to={"./join"}>Join Lobby</Link>
          <Link to={"./create"}>Create Lobby</Link>
          <Link to={"./browse"}>View Lobbies</Link>
        </div>
      )}
      {!isLoggedIn && (
        <div>You're not logged in, oops!</div>
      )}
      <Outlet />
    </div>
  );
}
