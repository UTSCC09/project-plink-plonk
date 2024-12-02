import React, { useState } from "react";
import BackLink from "../components/BackLink";
import { useNavigate } from "react-router-dom";
import { signup } from "../js/authentication.mjs";
import "../main.css";

const SignUp = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    e.target.reset();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const userData = { username, password };

    const signup_status = signup(userData);
    if (signup_status) {
      return navigate("/");
    } else {
      setMessage("Oops! Username already taken");
    }
  }

  return (
    <>
      <BackLink />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h2>Sign Up</h2>
        {message && <h3>{message}</h3>}
        <input
          type="text"
          placeholder="Username"
          name="username"
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </>
  );
};

export default SignUp;
