import React, { useState } from 'react';
//  ?? For Form component
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const submit =  async (e) => {
    
    e.preventDefault();
    console.log({ username, password }); // DELETE Later, obvi
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        onLogin = true;
        navigate("/");

      } else {
        const errorData = await response.json();
        setError(errorData.message);
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

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      {error && <p>{error}</p>}   
      <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required/>
      <input type="password" placeholder="Password"value={password} onChange={(e)=>setPassword(e.target.value)} required/>
      <button type="submit">Login</button>
      {/* <button onClick={handleSignupClick}>Signup</button> */}
    </form>
  );
};

export default Login;
