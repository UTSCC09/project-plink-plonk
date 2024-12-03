import { getPublicLobbies } from "../js/lobby.mjs";
import { useLoaderData, useRevalidator, Link } from "react-router-dom";
import { useEffect } from "react";

export async function loader() {
  const lobbies = await getPublicLobbies();
  return lobbies;
}

export default function LobbyList() {
  const lobbies = useLoaderData();
  const revalidator = useRevalidator();

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h3>Public Lobbies</h3>
      {
      lobbies.length
      ?
      (
        <table className="table-auto self-stretch">
          <thead>
            <tr>
              <th>Lobby Name</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>
            {lobbies.map((lobby) => (
              <tr key={lobby.code}>
                  <td><Link to={`../${lobby.code}`}>{lobby.name}</Link></td>
                  <td><Link to={`../${lobby.code}`}>{lobby.code}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )
      :
      <p>There are no public lobbies right now! Why don't you create one...</p>
      }
    </>
  );
}
