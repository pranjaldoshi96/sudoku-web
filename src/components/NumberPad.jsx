import React from 'react';
import '../styles/NumberPad.css';

function NumberPad({ 
  onNumberSelect, 
  onErase, 
  onUndo, 
  onRedo, 
  onReset, 
  onHint,
  onToggleNoteMode,
  isNoteMode = false,
  hintsRemaining = 0,
  selectedNumber, 
  numberCounts = Array(10).fill(9),
  canUndo = false, 
  canRedo = false
}) {
  // Create array of numbers 1-9
  const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
  
  return (
    <div className="number-pad">
      <div className="hint-section">
        <button 
          className={`hint-button ${hintsRemaining <= 0 ? 'disabled' : ''}`}
          onClick={() => {
            console.log("Hint button clicked");
            if (hintsRemaining > 0) {
              onHint();
            }
          }}
          disabled={hintsRemaining <= 0}
          title={hintsRemaining > 0 ? "Get a hint" : "No hints left"}
        >
          <span className="hint-icon">💡</span>
          <span className="hint-text">Hint</span>
          <span className="hints-remaining">{hintsRemaining}</span>
        </button>
      </div>
      
      <div className="note-mode-section">
        <button 
          className={`note-mode-button ${isNoteMode ? 'active' : ''}`}
          onClick={onToggleNoteMode}
          title={isNoteMode ? "Exit Notes Mode" : "Enter Notes Mode"}
        >
          <span className="note-icon">✏️</span>
          <span className="note-text">Notes</span>
          <span className={`note-indicator ${isNoteMode ? 'on' : 'off'}`}>
            {isNoteMode ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
      
      <div className="control-buttons">
        <button 
          className={`control-button ${!canUndo ? 'disabled' : ''}`}
          onClick={onUndo} 
          title="Undo"
          disabled={!canUndo}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M7.5 9H2v6h5.5l3-3-3-3zm9 0H12v6h4.5l3-3-3-3z" fill="currentColor" fillRule="evenodd" transform="rotate(180, 12, 12)"/>
          </svg>
        </button>
        
        <button 
          className={`control-button ${!canRedo ? 'disabled' : ''}`}
          onClick={onRedo} 
          title="Redo"
          disabled={!canRedo}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M7.5 9H2v6h5.5l3-3-3-3zm9 0H12v6h4.5l3-3-3-3z" fill="currentColor" fillRule="evenodd"/>
          </svg>
        </button>
        
        <button className="control-button" onClick={onErase} title="Erase">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M20 8v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8h16zm-1-6H5a1 1 0 0 0-1 1v1h16V3a1 1 0 0 0-1-1zM9 14H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" fill="currentColor" fillRule="evenodd" transform="rotate(180, 12, 12)"/>
          </svg>
        </button>
      </div>
      
      <div className="number-buttons">
        {numbers.map(num => (
          <button 
            key={num} 
            className={`number-button ${selectedNumber === num ? 'selected' : ''} ${numberCounts[num] === 0 ? 'completed' : ''}`}
            onClick={() => onNumberSelect(num)}
            disabled={numberCounts[num] === 0}
          >
            <span className="number-value">{num}</span>
            {numberCounts[num] === 0 ? (
              <span className="number-completed">✓</span>
            ) : (
              <span className="number-count">{numberCounts[num]}</span>
            )}
          </button>
        ))}
      </div>
      
      <button className="reset-button" onClick={onReset} title="Reset Puzzle">
        Reset Puzzle
      </button>
    </div>
  );
}

export default NumberPad; 