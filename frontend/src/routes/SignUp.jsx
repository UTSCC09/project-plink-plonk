import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../main.css";
import BackLink from "../components/BackLink";
import { useState } from "react";
import { Form, useNavigate, redirect } from "react-router-dom";
import { signup, checkAuth } from "../js/authentication.mjs";

export async function loader() {
  const isLoggedIn = await checkAuth();
  if (isLoggedIn) {
    return redirect("/home");
  }
  return null;
}

export default function SignUp() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const userData = { username, password };

    const success = await signup(userData);
    if (success) {
      return navigate("/");
    } else {
      e.target.reset();
      setMessage("Username already taken");
    }
  }

  return (
    <>
      <BackLink />
      <Form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <h2>Sign Up</h2>
        {message && <div className="message">{message}</div>}
        <input
          type="text"
          placeholder="Username"
          name="username"
          maxLength="20"
          pattern="[\w\-]{2,20}"
          title="2-20 alphanumeric or underscore and hyphen characters"
          autoComplete="off"
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          maxLength="100"
          autoComplete="off"
          required
        />
        <button type="submit" className="submitButton">Sign Up</button>
      </Form>
    </>
  );
}
