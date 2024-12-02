import { Outlet, Link, useLoaderData, redirect } from "react-router-dom";
import BackLink from "../components/BackLink";
import { getCookie, checkAuth } from "../js/authentication.mjs";

export async function loader() {
  const isLoggedIn = await checkAuth();
  if (!isLoggedIn) {
    return redirect("/");
  }
  const nickname = decodeURIComponent(getCookie("nickname"));
  return nickname;
}

export default function SignSprinter() {
  const nickname = useLoaderData();

  return (
    <div className="flex flex-col items-center justify-stretch gap-2">
      <BackLink />
      <h1>Sign Sprinter</h1>
      <div className="flex gap-6 items-center">
          <Link to={"./join"}>Join Lobby</Link>
          <Link to={"./create"}>Create Lobby</Link>
          <Link to={"./browse"}>View Lobbies</Link>
      </div>
      <div className="mt-8 flex flex-col gap-4 items-center self-stretch">
        <Outlet context={nickname} />
      </div>
    </div>
  );
}
