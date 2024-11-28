// everything for signup + login
// that's backend for the frontend

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

export function signup(userData, fail, success) {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  fetch(`${apiUrl}/api/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then(handleResponse)
    .then(success)
    .catch(fail);
}

export function logOut(success) {
  document.cookie = `lobbyId=; max-age=0; path=/;`;
  document.cookie = `isHost=; max-age=0; path=/;`;
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  fetch(`${apiUrl}/api/signout/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  })
    .then(handleResponse)
    .then(success)
    .catch(onError);
}
