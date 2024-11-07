import React, { useState } from 'react';
//  ?? For Form component
// import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    console.log({email, username, password});

  };

  return (
    <form onSubmit={submit}>
        <h2>Signup</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required/>
        <input type="password" placeholder="Password"value={password} onChange={(e)=>setPassword(e.target.value)} required/>
        <button type="submit">Sign Up!</button>
    </form>
  );
};


export default SignUp;
