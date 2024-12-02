import { useState } from "react";
import { Form, useNavigate, useLoaderData, redirect } from "react-router-dom";
import { changeNickname, getCookie, checkAuth } from "../js/authentication.mjs";
import BackLink from "../components/BackLink";

export async function loader() {
  const isLoggedIn = await checkAuth();
  if (!isLoggedIn) {
    return redirect("/");
  }
  const nickname = decodeURIComponent(getCookie("nickname"));
  return nickname;
}

export default function Profile() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const nickname = useLoaderData();

  async function handleSubmit(e) {
    e.preventDefault();
    const newName = e.target.newName.value;

    const success = await changeNickname(newName);
    if (success) {
      return navigate("/home"); 
    } else {
      e.target.reset();
      setMessage("Invalid nickname");
    }
  }

  return (
    <>
      <BackLink />
      <Form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <h2>Profile</h2>
        {message && <div className="message">{message}</div>}
        {<p className="self-start">Current Nickname: {nickname}</p>}
        <input
          type="text"
          placeholder="New nickname"
          name="newName"
          maxLength="20"
          pattern="[\w\-]{2,20}"
          title="2-20 alphanumeric or underscore and hyphen characters"
          autoComplete="off"
          required
        />
        <button type="submit" className="submitButton">Confirm</button>
      </Form>
    </>
  );
};
