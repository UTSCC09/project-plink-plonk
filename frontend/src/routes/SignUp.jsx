import React, { useState } from "react";
import BackLink from "../components/BackLink";
import { useNavigate } from "react-router-dom";
import { signup } from "../js/authentication.mjs";

export default function SignUp() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const userData = { username, password };

    const signup_status = await signup(userData);
    if (signup_status) {
      return navigate("/");
    } else {
      e.target.reset();
      setMessage("Username already taken");
    }
    
  }

  return (
    <>
      <BackLink />
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <h2>Sign Up</h2>
        {message && <h3>{message}</h3>}
        <input
          type="text"
          placeholder="Username"
          name="username"
          maxLength="20"
          autoComplete="off"
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          autoComplete="off"
          required
        />
        <button type="submit" className="submitButton">Sign Up</button>
      </form>
    </>
  );
}
