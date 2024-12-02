import React, { useState } from "react";
//  ?? For Form component
// import { Form } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { onError, signup } from "../js/authentication.mjs";
import "../main.css";
import BackLink from "../components/BackLink";

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
    console.log({ username, password });
    const userData = { username, password };
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
      <BackLink/>
      <h2 class="font-display text-4xl font-extrabold sm:text-5xl md:text-6xl xl:text-6.5xl">Signup</h2>
      <form className="space-y-6 justify-items-center mt-10" onSubmit={submit}>
        {error && <p>{error}</p>}
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
