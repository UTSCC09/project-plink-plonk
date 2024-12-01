// everything for signup + login
// that's backend for the frontend
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export function onError(err) {
  console.error("[error]", err);
  const error_box = document.querySelector("#error_box");
  error_box.innerHTML = err.message;
  error_box.style.visibility = "visible";
}

function handleResponse(res) {
  if (res.status < 200 && res.status >= 300) {
    return res.text().then((text) => {
      throw new Error(`${text} (status: ${res.status})`);
    });
  }

  return res.json();
}

export async function signup(userData) {
  const response = await fetch(`${apiUrl}/api/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (response.ok) {
    return true;
  } else {
    return false;
  }
}

export async function login(userData) {
  const response = await fetch(`${apiUrl}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
    credentials: "include",
  })
  if (response.ok) return true;
  else return false;
}

export async function changeNickname(newNickname) {
  console.log("Inputs:", { newNickname });
  try {
    const response = await fetch(`${apiUrl}/api/change-nickname`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname: newNickname }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to change nickname");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error changing nickname:", err);
    throw err;
  }
}


export function logOut(success) {
  document.cookie = `lobbyId=; max-age=0; path=/;`;
  document.cookie = `isHost=; max-age=0; path=/;`;
  fetch(`${apiUrl}/api/signout/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then(handleResponse)
    .then(success)
    .catch(onError);
}
