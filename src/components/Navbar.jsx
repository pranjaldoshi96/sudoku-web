import React from 'react';
import '../styles/Navbar.css';

function Navbar({ currentMode, setCurrentMode }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-title">Sudoku</div>
        <div className="navbar-modes">
          <button 
            className={`mode-button ${currentMode === 'classic' ? 'active' : ''}`}
            onClick={() => setCurrentMode('classic')}
          >
            Classic
          </button>
          <button 
            className={`mode-button ${currentMode === 'killer' ? 'active' : ''}`}
            onClick={() => setCurrentMode('killer')}
          >
            Killer
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 