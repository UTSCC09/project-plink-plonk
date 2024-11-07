import React, { useState } from 'react';
//  ?? For Form component
// import { Form } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    console.log({email, username, password});

    // Temporary fetching
    const userData = { email, username, password };

    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message); // Should log 'User registered successfully'
    } else {
      console.error('Error registering user');
    }

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