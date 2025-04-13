import React from 'react';
import '../styles/DifficultySelector.css';

function DifficultySelector({ currentMode, currentDifficulty, setCurrentDifficulty }) {
  // Different difficulty levels based on the game mode
  const difficultyLevels = {
    classic: ["Easy", "Medium", "Hard", "Expert", "Master", "Extreme"],
    killer: ["Easy", "Medium", "Hard", "Expert"]
  };
  
  // Get the appropriate difficulty options based on current mode
  const difficulties = difficultyLevels[currentMode] || difficultyLevels.classic;
  
  return (
    <div className="difficulty-selector">
      <div className="difficulty-title">Difficulty</div>
      <div className="difficulty-options">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            className={`difficulty-button ${currentDifficulty === difficulty.toLowerCase() ? 'active' : ''}`}
            onClick={() => setCurrentDifficulty(difficulty.toLowerCase())}
          >
            {difficulty}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DifficultySelector; 