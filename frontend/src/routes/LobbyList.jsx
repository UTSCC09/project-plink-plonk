import { getPublicLobbies } from "../js/lobby.mjs";
import { useLoaderData, Link } from "react-router-dom";

export async function loader() {
  const lobbies = await getPublicLobbies();
  return { lobbies };
}

export default function LobbyList() {
  const { lobbies } = useLoaderData();

  return (
    <div id="lobbyList">
      <h2>Public Lobbies</h2>
      {lobbies.length ? (
        <ul>
          {lobbies.map((lobby) => (
            <li key={lobby.code}>
              <div>
                <Link to={`../${lobby.code}`}>
                  {lobby.code}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>{"Omg there are no lobbies atm! How about you make one :)"}</p>
      )}
    </div>
  );
}
