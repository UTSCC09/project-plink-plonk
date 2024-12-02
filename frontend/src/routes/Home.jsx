import { logOut, getCookie, checkAuth } from "../js/authentication.mjs";
import { Link, useLoaderData, redirect } from "react-router-dom";

export async function loader() {
  const isLoggedIn = await checkAuth();
  if (!isLoggedIn) {
    return redirect("/");
  }
  const nickname = decodeURIComponent(getCookie("nickname"));
  return nickname;
}

export default function Home() {
  const nickname = useLoaderData();

  return (
    <>
      <h1>Sign Sprinter</h1>
      <h2>welcome, {nickname}</h2>
      <div>
        <img src="/motion.gif" alt="Motion GIF" className="h-80 w-auto" />
      </div> 
      <div className="flex flex-col gap-6 items-center">
        <Link to={"/play"}>Play</Link>
        <Link to={"/profile"}>Change Nickname</Link>
        <Link to={"/"} onClick={() => logOut()}>Log Out</Link>
      </div>
    </>
  );
}
