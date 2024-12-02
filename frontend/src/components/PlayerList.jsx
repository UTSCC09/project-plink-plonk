import React from "react";

function PlayerList({ playerList }) {
  return (
    <div className="w-full md:w-1/4 p-4">
      <h3 className="text-xl font-extrabold md:text-2xl xl:text-3lg">
        Players in Lobby:
      </h3>
      <ul>
        {playerList.map((player) => (
          <li key={player.id}>Player {player.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;