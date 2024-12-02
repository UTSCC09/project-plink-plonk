export {
  getCookie,
  signup,
  login,
  changeNickname,
  checkAuth,
  logOut
};

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

function onError(err) {
  console.error("[error]", err);
}

function handleResponse(res) {
  if (res.status < 200 && res.status >= 300) {
    return res.text().then((text) => {
      throw new Error(`${text} (status: ${res.status})`);
    });
  }

  return res.json();
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

async function signup(userData) {
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

async function login(userData) {
  const response = await fetch(`${apiUrl}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
    credentials: "include",
  })
  if (response.ok) {
    return true;
  } else {
    return false;
  }
}

async function changeNickname(newNickname) {
  const response = await fetch(`${apiUrl}/api/change-nickname`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname: newNickname }),
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return false;
  }
}

async function checkAuth() {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  const response = await fetch(`${apiUrl}/api/check-auth`, {
    method: "GET",
    credentials: "include",
  });
  if (response.ok) {
    return true;
  } else {
    return false;
  }
}

function logOut(success) {
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
