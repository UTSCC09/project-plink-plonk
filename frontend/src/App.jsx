import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameComponent from './components/GameComponent';  
import Login from './components/Login';  
import SignUp from './components/Signup';


function App() {
  const [count, setCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = (credentials) => {
    // authentication here !!!
    console.log('Logging in with:', credentials);
    setIsLoggedIn(true);
  };

  return (
    <div>{isLoggedIn ? (
      <GameComponent /> ) : (
      <Login onLogin={handleLogin}/>
      // <SignUp/>
      )}
    </div>
  )
}

export default App
