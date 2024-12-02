import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../js/authentication.mjs'
import BackLink from "../components/BackLink";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export default function LogIn() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  async function handleSubmit(e) {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const userData = { username, password };

    try {
      const success = await login(userData);
      console.log(success);
      if (success) {
        navigate("/"); 
      } else {
        e.target.reset();
        setMessage('Login failed');
      }
    } catch (err) {
      console.error('Login failed:', err);
      e.target.reset();
      setMessage('Login failed');
    }
  }
  
  return (
    <>
      <BackLink />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center mb-20">
        <h2>Log In</h2>
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
        <button type="submit" className="submitButton">Log In</button>
      </form>
      <Link to={`${apiUrl}/api/google/login`}>Log In with Google</Link>
    </>
  );
}
