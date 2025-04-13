import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import DifficultySelector from './components/DifficultySelector'

function App() {
  const [currentMode, setCurrentMode] = useState('classic')
  const [currentDifficulty, setCurrentDifficulty] = useState('easy')
  
  // When mode changes, set a default difficulty for that mode
  useEffect(() => {
    // Set default to easy for all modes
    if (currentMode === 'classic') {
      setCurrentDifficulty('easy')
    } else if (currentMode === 'killer') {
      setCurrentDifficulty('easy')
    }
  }, [currentMode])

  return (
    <div className="app-container">
      <Navbar currentMode={currentMode} setCurrentMode={setCurrentMode} />
      
      <div className="content-container">
        {/* New sidebar */}
        <div className="sidebar">
          <div className="sidebar-content">
            <DifficultySelector 
              currentMode={currentMode}
              currentDifficulty={currentDifficulty}
              setCurrentDifficulty={setCurrentDifficulty}
            />
            {/* You can add more sidebar controls here in the future */}
          </div>
        </div>
        
        {/* Main game area */}
        <main className="game-container">
          <h1>Sudoku - {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode</h1>
          <div className="game-board">
            {/* Sudoku board will be implemented here */}
            <p>Game board for {currentMode} mode at {currentDifficulty} difficulty</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
