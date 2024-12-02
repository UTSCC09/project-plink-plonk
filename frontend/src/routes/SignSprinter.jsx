import { Outlet, Link, redirect } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import BackLink from "../components/BackLink";
import { createLobby } from "../js/lobby.mjs";
import { checkAuth } from "../js/lobby.mjs";

export async function loader() {
  const isLoggedIn = await checkAuth();
  return { isLoggedIn };
}

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
  const { isLoggedIn } = useLoaderData();

  return (
    <div>
      <div>
        <h1>Sign Sprinter</h1>
        <BackLink />
      </div>
      {isLoggedIn
      ?
      <>
      <div className="flex flex-col gap-6 items-center">
          <Link to={"./join"}>Join Lobby</Link>
          <Link to={"./create"}>Create Lobby</Link>
          <Link to={"./browse"}>View Lobbies</Link>
      </div>
      <div className="mt-20 grow">
        <Outlet />
      </div>
      </>
      :
      <div>You're not logged in, oops!</div>
      }
      
    </div>
  );
}
