import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameComponent from './components/GameComponent';  


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Welcome to the Game!</h1>
      <GameComponent />
    </>
  )
}

export default App
