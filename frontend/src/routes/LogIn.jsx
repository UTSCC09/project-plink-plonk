import { useState } from 'react';
import { Form, useNavigate, Link, redirect } from 'react-router-dom';
import { login, checkAuth } from '../js/authentication.mjs'
import BackLink from "../components/BackLink";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export async function loader() {
  const isLoggedIn = await checkAuth();
  if (isLoggedIn) {
    return redirect("/home");
  }
  return null;
}

export default function LogIn() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  async function handleSubmit(e) {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const userData = { username, password };

    const success = await login(userData);
    if (success) {
      return navigate("/"); 
    } else {
      e.target.reset();
      setMessage('Login failed');
    }
  }

  const handleGoogleLogin = async () => {
    window.location.href = `${apiUrl}/api/google/login`;
  };
  
  return (
    <>
    <div className='flex-center'>
      <BackLink />
      <Form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center mb-20">
        <h2>Log In</h2>
        {message && <div className="message">{message}</div>}
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
          maxLength="100"
          autoComplete="off"
          required
        />
        <button type="submit" className="submitButton">Log In</button>
      </Form>
      <button class="font-semibold" onClick={handleGoogleLogin} className="button">Sign in with Google</button>
    </div>
    </>
  );
}
