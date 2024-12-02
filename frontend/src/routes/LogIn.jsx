import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../js/authentication.mjs'
import BackLink from "../components/BackLink";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

const Login = ({ onLogin }) => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  function handleSubmit(e) {
    e.preventDefault();
    e.target.reset();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const userData = { username, password };

    try {
      const success = login(userData);
      if (success) {
        onLogin = true;
        navigate("/"); 
      } else {
        setMessage('Login failed');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setMessage('Login failed');
    }
  };
  
  return (
    <>
      <BackLink />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h2>Login</h2>
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
        <button type="submit">Login</button>
        <Link to={`${apiUrl}/api/google/login`}>Login with Google</Link>
      </form>
    </>
  );
};

export default Login;
