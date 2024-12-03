export default function Game({
  gameEnd,
  gameProgress,
  progressList,
  username,
}) {
  // Progress bar display
  function displayRace(current, end, token, isCurrentUser) {
    const progress = (current / end) * 100;
    return (
      <div className="flex items-center space-x-4">
        <span className="w-64 font-bold">{token}</span>
        <div className="relative w-full bg-gray-200 h-6 rounded-md overflow-hidden border-2 [border-color:#742834]">
        <div
            className={`absolute top-0 left-0 h-full transition-all ${
              isCurrentUser ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-12 text-sm">{current > end ? `${end}/${end}` : `${current}/${end}`}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current player */}
      <div>{displayRace(gameProgress, gameEnd, "You", true)}</div>

      {/* Other players */}
      {progressList.map(
        (player) =>
          player.username !== username && (
            <div key={player.username}>
              {displayRace(player.progress, gameEnd, player.username, false)}
            </div>
          )
      )}
    </div>
  );
}
