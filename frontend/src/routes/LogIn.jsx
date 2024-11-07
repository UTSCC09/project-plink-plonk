import React, { useState } from 'react';
//  ?? For Form component
// import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    console.log({ username, password });
    onLogin({ username, password });
  };

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required/>
      <input type="password" placeholder="Password"value={password} onChange={(e)=>setPassword(e.target.value)} required/>
      <button type="submit">Login</button>
      <button>Signup</button>
    </form>
  );
};

export default Login;
