export default function Game({
  gameEnd,
  gameProgress,
  progressList,
  username,
}) {
  // Placeholder for UI :'(
  function displayRace(current, end, token) {
    if (current < 1) {
      return token + " |" + " _ ".repeat(end) + "|";
    }
    if (current > end) {
      return "|" + " _ ".repeat(end) + "| " + token;
    }
    const before = current - 1;
    const after = end - current;
    return "|" + " _ ".repeat(before) + token + " _ ".repeat(after) + "|";
  }

  return (
    <div>
      <div>{displayRace(gameProgress, gameEnd, "You")}</div>

      {progressList.map(
        (player) =>
          player.username !== username && (
            <div key={player.username}>{displayRace(player.progress, gameEnd, player.username)}</div>
          )
      )}
    </div>
  );
}

