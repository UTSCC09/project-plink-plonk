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
    <div className="flex flex-col gap-6">
      <h3>Public Lobbies</h3>
      {isLoggedIn ? (
        lobbies.length ? (
          <ul className="flex flex-col gap-4 items-stretch">
            <li key="header" className="flex gap-4 justify-between">
              <span className="basis-2/4">Lobby Name</span>
              <span>Code</span>
              <span>Host</span>
            </li>
            {lobbies.map((lobby) => (
              <li key={lobby.code} className="flex gap-4 justify-between">
                <span className="basis-2/4">{lobby.name}</span>
                <span>{lobby.code}</span>
                <span>{lobby.host}</span>
                <Link to={`../${lobby.code}`}>Go</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>{"There are no public lobbies right now! How about you make one :)"}</p>
        )
      ) : (
        <p>{"You must be logged in to view the lobbies."}</p>
      )}
    </div>
  );
}
