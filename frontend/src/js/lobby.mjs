export {
  createLobby,
  deleteLobby,
  getLobby,
  getPublicLobbies
}

/**
 * A Lobby has the following fields:
 *  code - string, not mutable
 *  name - string, editable
 *  members - [string of Users]
 *  host - one of the members that owns the room
 */

const firstWordBank = [
  "Slippery", "Yellow"
]

const secondWordBank = [
  "Banana", "Mango", "Papaya"
]

function generateLobbyName() {
  return firstWordBank[getRandomInt(0, firstWordBank.length)] + secondWordBank[getRandomInt(0, secondWordBank.length)];
}

async function createLobby(name) {
  const lobbyName = generateLobbyName();
  // check lobby does ont already exist
  // post to api

  return lobbyName;
}

async function deleteLobby() {
  // delete to api
}

async function getLobby(code) {
  // get lobby
  // if not exists ...
  return null;
}

async function getPublicLobbies() {
  // get list of all public lobbies
  const lobbies = [{code: "test1"}, {code: "test2"}]
  return lobbies;
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
