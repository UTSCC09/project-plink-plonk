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
    <form class="flex flex-col space-y-6" onSubmit={submit}>
      <h2 class="font-display text-4xl font-extrabold sm:text-5xl md:text-6xl xl:text-6.5xl">Login</h2>
      {error && <p>{error}</p>}
      <input class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-5 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black-600 sm:text-sm/6" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black-600 sm:text-sm/6" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button class="w-full justify-center rounded-md bg-black-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600" type="submit">Login</button>
      {/* <button onClick={handleSignupClick}>Signup</button> */}
    </form>
    <div class="mt-1"></div>
    <button class="font-semibold text-indigo-600 hover:text-indigo-500" onClick={handleGoogleLogin} className="button">Sign in with Google</button>
    </>
  );
};

export default Login;
