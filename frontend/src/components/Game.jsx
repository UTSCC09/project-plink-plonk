export default function Game({ gameEnd, gameProgress, messages }) {
  // Placeholder for UI :'(
  function displayRace(current, end, token) {
    const before = Math.max(current - 1, 0);
    const after = end - current;
    return " _ ".repeat(before) + token + " _ ".repeat(after);
  }
  return (
    <div>
      <div>{displayRace(gameProgress, gameEnd, "Y")}</div>
      <div>{displayRace(messages[0], gameEnd, "O")}</div>
    </div>
  );
}
