import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../js/authentication.mjs'

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const submit =  async (e) => {
    e.preventDefault();
    console.log({ username, password }); // DELETE Later, obvi
    const userData = { username, password };

    try {
      const success = await login(userData);

      if (success) {
        onLogin = true;
        navigate("/"); 
      } else {
        setError('Login failed');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed');
    } finally {
      setUsername('');
      setPassword('');
    }
  }; 

  // const handleSignupClick = () => {
  //   navigate("/signup"); // Navigate to signup page
  // };

  const handleGoogleLogin = async () => {
    window.location.href = `${apiUrl}/api/google/login`;
  };
  
  return (
    <>
    <h2 class="font-display text-4xl font-extrabold sm:text-5xl md:text-6xl xl:text-6.5xl">Login</h2>
    <form class="flex flex-col space-y-6 justify-center" onSubmit={submit}>
      {error && <p>{error}</p>}
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Login</button>
      {/* <button onClick={handleSignupClick}>Signup</button> */}
    </form>
    <div class="mt-1"></div>
    <button onClick={handleGoogleLogin} className="button">Sign in with Google</button>
    </>
  );
};

export default Login;