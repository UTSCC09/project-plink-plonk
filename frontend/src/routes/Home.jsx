import "../main.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { logOut, changeNickname, onError } from "../js/authentication.mjs";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../js/lobby.mjs";

export default function Home() {
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
      <h1 class="font-display text-4xl font-extrabold sm:text-5xl md:text-6xl xl:text-6.5xl">Plink Plonk</h1>
      <img 
      src="/motion.gif" 
      alt="Motion GIF" 
      style={{ width: "300px", height: "auto" }} 
    />
      {isLoggedIn ? <LoggedIn /> : <Public />}
    </div>
  );
}


function LoggedIn() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessNickname, setShowSuccessNickname] = useState(false);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [newNickname, setNewNickname] = useState("");
 
  async function handleChangeNickname(e) {
    e.preventDefault(); 
    try {
      const result = await changeNickname(newNickname);
      setShowNicknameInput(false); 
      setShowSuccessNickname(true);
      setNewNickname('');
      setTimeout(() => {
        setShowSuccessNickname(false);
      }, 900);
      console.log(result.message);
    } catch (err) {
      console.error("Failed to change nickname:", err.message);
    }
  }

  return (
    <div>
      {showSuccess && (
        <div className="popup">
          <p>Successfully logged out!</p>
        </div>
      )}
      {showSuccessNickname && (
        <div className="popup">
          <p>Successfully changed nickname!</p>
        </div>
      )}
      <div className="link-container">
        <Link to={"/play"}>Play Sign Sprint</Link>
        <Link
          onClick={(e) => {
            e.preventDefault();  
            logOut(()=>{
              setShowSuccess(true);
              setTimeout(() => {
                setShowSuccess(false);
                window.location.reload(); 
              }, 1000);
            })
          }}
        >
          Log Out
        </Link>
      </div>
      <div>
        {!showNicknameInput ? (
          <button onClick={() => setShowNicknameInput(true)}>Click to Change Nickname</button>) : (
          <div>
            <form onSubmit={handleChangeNickname}>
              <input
                type="text"
                placeholder="Enter new nickname"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                required
              />
              <button type="submit">Change Nickname</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Public() {
  return (
    <div className="link-container">
      <Link to={"/login"}>Log In</Link>
      <Link to={"/signup"}>Sign Up</Link>
    </div>
  );
}
