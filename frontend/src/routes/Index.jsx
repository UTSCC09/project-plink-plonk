import { Link, redirect } from "react-router-dom";
import { checkAuth } from "../js/authentication.mjs";

export async function loader() {
  const isLoggedIn = await checkAuth();
  if (isLoggedIn) {
    return redirect("/home");
  }
  return null;
}

export default function Index() {
  return (
    <>
      <h1>Sign Sprinter</h1>
      <div>
        <img src="/motion.gif" alt="Motion GIF" className="h-80 w-auto" />
      </div> 
      <div className="flex flex-col gap-6 items-center">
        <Link to={"/login"}>Log In</Link>
        <Link to={"/signup"}>Sign Up</Link>
      </div>
    </>
  );
}
