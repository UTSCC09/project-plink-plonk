import "../main.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { logOut, getCookie } from "../js/authentication.mjs";
import { useLoaderData } from "react-router-dom";
import { checkAuth } from "../js/lobby.mjs";

export async function loader() {
  const isLoggedIn = await checkAuth();
  const storedNickname = isLoggedIn ? decodeURIComponent(getCookie("nickname")) : "";
  return { isLoggedIn, storedNickname };
}

export default function Home() {
  const { isLoggedIn, storedNickname } = useLoaderData();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    setNickname(storedNickname);
  }, []);

  return (
    <>
      <h1>Sign Sprinter</h1>
      {isLoggedIn ? <h2>welcome, {nickname}</h2> : ""}
      <div>
        <img src="/motion.gif" alt="Motion GIF" className="h-80 w-auto" />
      </div> 
      <div className="flex flex-col gap-6 items-center">
        {isLoggedIn
        ?
        <>
          <Link to={"/play"}>Play</Link>
          <Link to={"/profile"}>Change Nickname</Link>
          <Link reloadDocument to={"."} onClick={() => logOut()}>Log Out</Link>
        </>
        :
        <>
          <Link to={"/login"}>Log In</Link>
          <Link to={"/signup"}>Sign Up</Link>
          </>
        }
      </div>
    </>
  );
}
