import React, { useState } from "react";
//  ?? For Form component
// import { Form } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { onError, signup } from "../js/authentication.mjs";
import "../main.css";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    console.log({ email, username, password });
    const userData = { email, username, password };
    const signup_status = await signup(userData);
    if (signup_status) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1700);
    }
    if (!signup_status) {
      setShowFailure(true);
      setTimeout(() => {
        setShowFailure(false);
      }, 1100);
    }
    setUsername("");
    setPassword("");
    setEmail("");
  };

  return (
    <div>
      {showSuccess && (
        <div className="popup">
          <p>Successfully signed up, login now!</p>
        </div>
      )}
      {showFailure && (
        <div className="popup">
          <p>Oops! Username already taken</p>
        </div>
      )}
      <form onSubmit={submit}>
        <h2>Signup</h2>
        {error && <p>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up!</button>
      </form>
    </div>
  );
};

export default SignUp;
