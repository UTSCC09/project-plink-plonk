import { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  //TO DO: AUTHENTICATION

  return (
    <div>
      <h1>Plink Plonk</h1>
      {isLoggedIn ? (
        <LoggedIn 
          setIsLoggedIn={setIsLoggedIn}/>
      ) : (
        <Public
          setIsLoggedIn={setIsLoggedIn}/>
      )}
    </div>
  );
}

function LoggedIn({setIsLoggedIn}) {
  function logOut() {
    console.log("please implement me :'(");
    // placeholder
    // clear session
  }

  function logOutFake() {
    setIsLoggedIn(false);
  }

  return (
    <div>
      <Link to={"/play"}>
        Play Sign Sprint
      </Link>
      <Link onClick={logOut}>
        Log Out
      </Link>
      <Link onClick={logOutFake}>
        Log Out(fake)
      </Link>
    </div>
  );
}

function Public({setIsLoggedIn}) {
  function logInFake() {
    // Placeholder
    setIsLoggedIn(true);
    console.log("loggedin fake");
  }

  return (
    <div>
      <Link to={"/login"}>
        Log In
      </Link>
      <Link to={"/signup"}>
        Sign Up
      </Link>
      
      <Link onClick={logInFake}>
        Log In (fake)
      </Link>
    </div>
  );
}
