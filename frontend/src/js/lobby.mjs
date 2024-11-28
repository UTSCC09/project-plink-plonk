export {
  createLobby,
  deleteLobby,
  getPublicLobbies,
  checkLobbyExist,
  checkIsHost,
  closeLobbyVisibility,
  checkAuth,
};

/**
 * A Lobby has the following fields:
 *  code - string, not mutable
 *  name - string, editable
 *  members - [string of Users]
 *  host - one of the members that owns the room
 */

function handleResponse(res) {
  if (res.status < 200 && res.status >= 300) {
    return res.text().then((text) => {
      throw new Error(`${text} (status: ${res.status})`);
    });
  }

  return res.json();
}

const firstWordBank = [
  "Slippery",
  "Yellow",
  "Yummy",
  "Funny",
  "Chunky",
  "Cheeky",
  "Sassy",
  "Goofy",
  "Snazzy",
  "Jiggly",
  "Silly",
  "Snuggly",
  "Quirky",
  "Cozy",
  "Fluffy",
  "Spunky",
  "Feisty",
  "Dizzy"
];

const secondWordBank = [
  "Banana",
  "Mango",
  "Papaya",
  "Chicken",
  "Turkey",
  "Pineapple",
  "Avocado",
  "Pancake",
  "Burrito",
  "Noodle",
  "Meatball",
  "Dumpling",
  "Cookie",
  "Tofu",
  "Cupcake",
  "Sushi",
  "Waffle",
  "Bagel",
  "Muffin",
  "Cheesecake",
  "Pudding",
  "Taco",
  "Jellybean",
  "Marshmallow",
  "Cabbage",
  "Popcorn",
  "Pretzel",
  "Donut",
  "Biscuit",
  "Pickle"
];

function generateLobbyName() {
  return (
    firstWordBank[getRandomInt(0, firstWordBank.length)] +
    secondWordBank[getRandomInt(0, secondWordBank.length)]
  );
}

async function checkAuth() {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  let authorized = false;
  try {
    const response = await fetch(`${apiUrl}/api/check-auth`, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      authorized = true;
    }
  } catch (error) {
    console.error("Error checking if user is authorized:", error);
    return false; // Default to false on error
  }

  return authorized;
}

async function checkIsHost(code) {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/lobby/${code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      // Response status is 200, user is host
      return true;
    } else {
      // User is not host
      return false;
    }
  } catch (error) {
    console.error("Error checking host status:", error);
    return false; // Default to false on error
  }
}

async function checkLobbyExist(name, code) {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  fetch(`${apiUrl}/api/lobby/exist/${name}/${code}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        // Response status is 200, lobby does not exist
        return false;
      } else {
        // lobby exists
        return true;
      }
    })
    .catch((error) => {
      console.error("Error checking lobby existence:", error);
      return true; // In case of error, assume lobby does exist. reject
    });
}

async function createLobby(name, visibility) {
  // check lobby doesn't already exist
  let code = generateLobbyName();
  while (await checkLobbyExist(code)) {
    code = generateLobbyName();
  }

  //const lobbyName = generateLobbyName();
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  fetch(`${apiUrl}/api/lobby/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, code, visibility }),
  }).then(handleResponse);

  // post to api
  return code;
}

async function closeLobbyVisibility(code) {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  fetch(`${apiUrl}/api/lobby/close/${code}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ code }),
  }).then(handleResponse);
  // post to api
  return code;
}

async function deleteLobby(code) {
  try {
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const response = fetch(`${apiUrl}/api/lobby/delete/${code}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ code }),
    }).then(handleResponse);
    // post to api
    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error deleting lobby", error);
  }
}

// don't really need this..  the code is already going to be passed in the url
// and isHost can be specified from either Create lobby or Join Lobby
// async function getLobby(code) {
//   // get lobby
//   // if not exists ...
//   return { lobbyId: code }; // return just the id for now
// }

async function getPublicLobbies() {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/lobby/public`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data); // Use or return the `data` as needed
    return data.data;
  } catch (error) {
    console.error("Error fetching public lobbies:", error);
  }
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
