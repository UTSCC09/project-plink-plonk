import { getPublicLobbies } from "../js/lobby.mjs";
import { useLoaderData, Link } from "react-router-dom";
import { checkAuth } from "../js/lobby.mjs";
import { useState, useEffect } from "react";


export async function loader() {
  const lobbies = await getPublicLobbies();
  return { lobbies };
}

export default function LobbyList() {
  const { lobbies: initialLobbies } = useLoaderData();
  const [lobbies, setLobbies] = useState(initialLobbies);
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

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const lobbies = await getPublicLobbies();
      setLobbies(lobbies);  
    }, 2500);  
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div id="lobbyList">
      <h2>Public Lobbies</h2>
  
      {isLoggedIn ? (
        lobbies.length ? (
          <ul>
            {lobbies.map((lobby) => (
              <li key={lobby.code}>
                <div>
                  <Link to={`../${lobby.code}`}>{lobby.name}</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>{"Omg there are no lobbies atm! How about you make one :)"}</p>
        )
      ) : (
        <p>{"You must be logged in to view the lobbies."}</p>
      )}
    </div>
  );
}
