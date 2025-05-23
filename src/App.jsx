import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import DifficultySelector from './components/DifficultySelector'
import Board from './components/Board'
import NumberPad from './components/NumberPad'
import Timer from './components/Timer'
import { generatePuzzle, generateKillerPuzzle } from './utils/SudokuGenerator'
import { findNextHint, validatePuzzleState } from './utils/SudokuSolver'
import KillerBoard from './components/KillerBoard'
import AdComponent from './components/AdComponent'

function App() {
  const [currentMode, setCurrentMode] = useState('classic')
  const [currentDifficulty, setCurrentDifficulty] = useState('easy')
  const [selectedNumber, setSelectedNumber] = useState(null)
  const [puzzle, setPuzzle] = useState(null)
  const [solution, setSolution] = useState(null)
  const [userEntries, setUserEntries] = useState(null)
  const [incorrectCells, setIncorrectCells] = useState([])  // Track incorrect cell positions
  const [selectedCell, setSelectedCell] = useState(null)
  const [gameState, setGameState] = useState({
    isActive: false,
    isCompleted: false,
    isGameOver: false,
    elapsedTime: 0,
    score: 0,
    mistakes: 0,
    hintsRemaining: 3
  });
  
  // Add history tracking for undo/redo functionality
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Add a state to track which cells were filled by hints
  const [hintCells, setHintCells] = useState([]);
  
  // Add a state for the hint message
  const [hintMessage, setHintMessage] = useState('');
  
  // Add a new state for the highlighted number
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  
  // Add a new state for notes
  const [notes, setNotes] = useState(Array(9).fill().map(() => Array(9).fill().map(() => [])));
  
  // Add a state to track if we're in note-taking mode
  const [isNoteMode, setIsNoteMode] = useState(false);
  
  // Add a state for counting remaining numbers
  const [numberCounts, setNumberCounts] = useState(Array(10).fill(9)); // Index 0 unused, 1-9 for digits
  
  // Add a refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add a new state for cages
  const [cages, setCages] = useState(null);
  
  // Add a new state for showing the completion ad
  const [showCompletionAd, setShowCompletionAd] = useState(false);
  
  // Modify the useEffect to depend on refreshTrigger
  useEffect(() => {
    if (currentMode === 'classic') {
      // Try to generate a valid puzzle, with retries if needed
      let attempts = 0;
      let validPuzzle = false;
      let puzzleData = { puzzle: null, solution: null };
      
      while (!validPuzzle && attempts < 5) {
        puzzleData = generatePuzzle(currentDifficulty.toLowerCase());
        
        // Verify that the puzzle is valid
        const isValid = validatePuzzleState(puzzleData.puzzle) && 
                        validatePuzzleState(puzzleData.solution);
        
        if (isValid) {
          validPuzzle = true;
        } else {
          attempts++;
          console.warn(`Generated an invalid puzzle, retrying (attempt ${attempts})`);
        }
      }
      
      setPuzzle(puzzleData.puzzle);
      setSolution(puzzleData.solution);
      
      // Initialize user entries grid with nulls
      const entries = Array(9).fill().map(() => Array(9).fill(null));
      setUserEntries(entries);
      
      // Reset selected cell and number
      setSelectedCell(null);
      setSelectedNumber(null);
      setIncorrectCells([]);
      
      // Reset hint cells and message
      setHintCells([]);
      setHintMessage('');
      
      // Reset game state
      setGameState({
        isActive: true,
        isCompleted: false,
        isGameOver: false,
        elapsedTime: 0,
        mistakes: 0,
        hintsRemaining: 3
      });
      
      // Reset history
      setHistory([]);
      setHistoryIndex(-1);
      
      // Reset notes
      const emptyNotes = Array(9).fill().map(() => Array(9).fill().map(() => []));
      setNotes(emptyNotes);
    } 
    else if (currentMode === 'killer') {
      // Try to generate a valid killer puzzle, with retries if needed
      let attempts = 0;
      let validPuzzle = false;
      let puzzleData = { puzzle: null, solution: null, cages: null };
      
      while (!validPuzzle && attempts < 5) {
        puzzleData = generateKillerPuzzle(currentDifficulty.toLowerCase());
        
        // Basic validation
        if (puzzleData.puzzle && puzzleData.solution && puzzleData.cages) {
          validPuzzle = true;
        } else {
          attempts++;
          console.warn(`Generated an invalid killer puzzle, retrying (attempt ${attempts})`);
        }
      }
      
      setPuzzle(puzzleData.puzzle);
      setSolution(puzzleData.solution);
      setCages(puzzleData.cages);
      
      // Initialize user entries grid with nulls
      const entries = Array(9).fill().map(() => Array(9).fill(null));
      setUserEntries(entries);
      
      // Reset selected cell and number
      setSelectedCell(null);
      setSelectedNumber(null);
      setIncorrectCells([]);
      
      // Reset hint cells and message
      setHintCells([]);
      setHintMessage('');
      
      // Reset game state
      setGameState({
        isActive: true,
        isCompleted: false,
        isGameOver: false,
        elapsedTime: 0,
        mistakes: 0,
        hintsRemaining: 3
      });
      
      // Reset history
      setHistory([]);
      setHistoryIndex(-1);
      
      // Reset notes
      const emptyNotes = Array(9).fill().map(() => Array(9).fill().map(() => []));
      setNotes(emptyNotes);
    }
  }, [currentMode, currentDifficulty, refreshTrigger]); // Add refreshTrigger as a dependency
  
  // When mode changes, set a default difficulty for that mode
  useEffect(() => {
    // Set default to easy for all modes
    if (currentMode === 'classic') {
      setCurrentDifficulty('easy')
    } else if (currentMode === 'killer') {
      setCurrentDifficulty('easy')
    }
  }, [currentMode])

  // Handle number selection from number pad
  const handleNumberSelect = (number) => {
    // Set the highlighted number when selecting from number pad
    setHighlightedNumber(number);
    
    // If a cell is selected, fill it with the number
    if (selectedCell) {
      fillCell(selectedCell[0], selectedCell[1], number);
      // Clear the selected number after filling
      setSelectedNumber(null);
    } else {
      // Only select the number if no cell is selected yet
      setSelectedNumber(number);
    }
  };
  
  // Handle cell selection
  const handleCellSelect = (row, col) => {
    setSelectedCell([row, col]);
    
    // If a number is already selected on the number pad, fill the cell
    // But only if it's not an initial cell
    if (selectedNumber !== null && puzzle[row][col] === null) {
      fillCell(row, col, selectedNumber);
      setSelectedNumber(null);
    }
  };
  
  // Save the current state to history
  const saveToHistory = (entries, mistakes, incorrectCellsList, notesList) => {
    // Create a snapshot of the current state
    const stateSnapshot = {
      entries: entries.map(row => [...row]),
      mistakes,
      incorrectCells: incorrectCellsList.map(cell => [...cell]),
      hintCells: hintCells.map(cell => [...cell]),
      notes: notesList.map(row => row.map(cellNotes => [...cellNotes])),
      numberCounts: [...numberCounts]
    };
    
    // Create a new history array with all states up to current index
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add the snapshot and update history
    setHistory([...newHistory, stateSnapshot]);
    setHistoryIndex(historyIndex + 1);
  };
  
  // Fill a cell with a number
  const fillCell = (row, col, number) => {
    if (!userEntries || !puzzle || !solution) return;
    
    // Don't modify cells that were part of the initial puzzle
    if (puzzle[row][col] !== null) return;
    
    if (isNoteMode) {
      // Handle note mode - toggle the number in notes
      const newNotes = [...notes];
      const cellNotes = [...newNotes[row][col]];
      
      // Toggle the number in notes (add if not present, remove if present)
      const noteIndex = cellNotes.indexOf(number);
      if (noteIndex === -1) {
        cellNotes.push(number);
      } else {
        cellNotes.splice(noteIndex, 1);
      }
      
      // Sort notes for consistent display
      cellNotes.sort((a, b) => a - b);
      
      newNotes[row][col] = cellNotes;
      setNotes(newNotes);
      return;
    }
    
    // If the cell already has this number, do nothing
    if (userEntries[row][col] === number) return;
    
    // Standard filling behavior
    const newEntries = userEntries.map(r => [...r]);
    
    // Clear notes for this cell when filling it
    const newNotes = [...notes];
    newNotes[row][col] = [];
    setNotes(newNotes);
    
    newEntries[row][col] = number;
    
    // Check if the entry is correct
    const isCorrect = solution[row][col] === number;
    
    let newIncorrectCells = [...incorrectCells];
    let newMistakes = gameState.mistakes;
    
    if (!isCorrect) {
      // Add to incorrect cells list
      newIncorrectCells = [...incorrectCells, [row, col]];
      
      // Increment mistake count
      newMistakes = gameState.mistakes + 1;
      setGameState(prev => ({
        ...prev,
        mistakes: newMistakes,
        isGameOver: newMistakes >= 3 // Game over if 3 or more mistakes
      }));
    } else {
      // Remove from incorrect cells if it was incorrect before but is now correct
      newIncorrectCells = incorrectCells.filter(
        cell => !(cell[0] === row && cell[1] === col)
      );
      
      // Check if the puzzle is completed
      checkCompletion(newEntries);
    }
    
    // Save to history before updating the state
    saveToHistory(newEntries, newMistakes, newIncorrectCells, newNotes);
    
    // Update the state
    setUserEntries(newEntries);
    setIncorrectCells(newIncorrectCells);
    
    // Update number counts
    const newCounts = [...numberCounts];
    newCounts[number]--;
    setNumberCounts(newCounts);
  };
  
  // Handle erase button
  const handleErase = () => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      
      if (puzzle[row][col] !== null) return; // Don't erase initial cells
      
      // If we're in note mode and the cell has notes, just clear the notes
      if (isNoteMode && notes[row][col].length > 0) {
        const newNotes = [...notes];
        newNotes[row][col] = [];
        setNotes(newNotes);
        return;
      }
      
      // If we're not in note mode or the cell has no notes but has a value, clear the value
      if (userEntries[row][col] !== null) {
        const newEntries = userEntries.map(r => [...r]);
        
        // If this is clearing a number, we should clear the highlight too
        if (newEntries[row][col] !== null && newEntries[row][col] === highlightedNumber) {
          setHighlightedNumber(null);
        }
        
        newEntries[row][col] = null;
        
        // Create a snapshot for history
        saveToHistory(newEntries, gameState.mistakes, incorrectCells, notes);
        
        // Remove from incorrect cells if it was incorrect
        if (incorrectCells.some(cell => cell[0] === row && cell[1] === col)) {
          const newIncorrectCells = incorrectCells.filter(
            cell => !(cell[0] === row && cell[1] === col)
          );
          setIncorrectCells(newIncorrectCells);
        }
        
        setUserEntries(newEntries);
        
        // Update number counts
        const newCounts = [...numberCounts];
        newCounts[userEntries[row][col]]++;
        setNumberCounts(newCounts);
      }
    }
  };
  
  // Check if a cell contains an incorrect entry
  const isIncorrectCell = (row, col) => {
    return incorrectCells.some(cell => cell[0] === row && cell[1] === col);
  };
  
  // Check if the puzzle is completed
  const checkCompletion = (entries) => {
    if (!entries || !puzzle || !solution) return;
    
    // Check if all cells are filled and correct
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        // Get the value from the puzzle or user entries
        const value = puzzle[row][col] !== null ? puzzle[row][col] : entries[row][col];
        
        // If any cell is empty or doesn't match the solution, the puzzle is not complete
        if (value === null || value !== solution[row][col]) {
          return;
        }
      }
    }
    
    // If we got here, the puzzle is complete
    setGameState(prev => ({
      ...prev,
      isCompleted: true,
      score: calculateScore()
    }));
    
    // Set state to show ad
    setShowCompletionAd(true);
    
    // Set timeout to hide ad after viewing (adjust time as needed)
    setTimeout(() => {
      setShowCompletionAd(false);
      // Then show the completion modal
      setGameState(prev => ({
        ...prev,
        isCompleted: true
      }));
    }, 7000); // Show ad for 7 seconds
  };
  
  // Calculate score based on difficulty, time and mistakes
  const calculateScore = () => {
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      expert: 3,
      master: 4,
      extreme: 5
    };
    
    const multiplier = difficultyMultiplier[currentDifficulty.toLowerCase()] || 1;
    const timeBonus = Math.max(1, 1000 - gameState.elapsedTime);
    const mistakePenalty = gameState.mistakes * 200; // 200 points penalty per mistake
    const hintPenalty = (3 - gameState.hintsRemaining) * 150; // 150 points penalty per hint used
    
    return Math.max(0, Math.floor(1000 * multiplier + timeBonus - mistakePenalty - hintPenalty));
  };
  
  // Handle Undo action
  const handleUndo = () => {
    // The issue is in this condition - we're only undoing if historyIndex > 0
    // but we need to undo when there's at least one item in history
    if (historyIndex >= 0) {  // Changed from historyIndex > 0
      // Go back one step in history
      const newIndex = historyIndex - 1;
      
      // If we're at the first item, we need special handling
      if (newIndex < 0) {
        // When undoing the first action, we need to handle it specially
        // We can either:
        // 1. Reset to initial state
        // 2. Stay at the first history item but perform special actions
        // Let's do #1 for simplicity
        
        const emptyEntries = Array(9).fill().map(() => Array(9).fill(null));
        setUserEntries(emptyEntries);
        setIncorrectCells([]);
        setHintCells([]);
        
        // Reset notes
        const emptyNotes = Array(9).fill().map(() => Array(9).fill().map(() => []));
        setNotes(emptyNotes);
        
        // Keep the current mistake count
        // Update counts to only include puzzle numbers
        updateNumberCounts(puzzle, emptyEntries);
      } else {
        // Normal undo operation for historyIndex > 0
        const previousState = history[newIndex];
        
        // Restore the state
        setUserEntries(previousState.entries.map(row => [...row]));
        setIncorrectCells(previousState.incorrectCells.map(cell => [...cell]));
        setHintCells(previousState.hintCells.map(cell => [...cell]));
        setNotes(previousState.notes.map(row => row.map(cellNotes => [...cellNotes])));
        setNumberCounts(previousState.numberCounts);
      }
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        mistakes: prev.mistakes // Keep the current mistake count
      }));
      
      // Update the history index
      setHistoryIndex(newIndex);
    }
  };
  
  // Handle Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      // Go forward one step in history
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      // Restore the state
      setUserEntries(nextState.entries.map(row => [...row]));
      setIncorrectCells(nextState.incorrectCells.map(cell => [...cell]));
      setHintCells(nextState.hintCells.map(cell => [...cell]));
      setNotes(nextState.notes.map(row => row.map(cellNotes => [...cellNotes])));
      setNumberCounts(nextState.numberCounts);
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        mistakes: nextState.mistakes
      }));
      
      // Update the history index
      setHistoryIndex(newIndex);
    }
  };

  // Handle puzzle reset
  const handleReset = () => {
    // Only reset if there's an active puzzle
    if (puzzle) {
      // Reset user entries to empty grid
      const entries = Array(9).fill().map(() => Array(9).fill(null));
      setUserEntries(entries);
      
      // Reset notes
      const emptyNotes = Array(9).fill().map(() => Array(9).fill().map(() => []));
      setNotes(emptyNotes);
      
      // Clear selections and mistakes
      setSelectedCell(null);
      setSelectedNumber(null);
      setHighlightedNumber(null);
      setIncorrectCells([]);
      
      // Reset game state but keep timer running
      setGameState(prev => ({
        ...prev,
        isCompleted: false,
        isGameOver: false,
        score: 0,
        mistakes: 0,
        hintsRemaining: 3
      }));
      
      // Reset history
      setHistory([]);
      setHistoryIndex(-1);
      
      // Clear hint cells
      setHintCells([]);
      setHintMessage('');
      
      // Reset number counts to only include puzzle numbers
      updateNumberCounts(puzzle, Array(9).fill().map(() => Array(9).fill(null)));
    }
  };

  // Add a handler for clearing a specific cell
  const handleClearCell = (row, col) => {
    if (!userEntries || !puzzle) return;
    
    // Don't clear initial puzzle cells
    if (puzzle[row][col] !== null) return;
    
    // Create a copy of the user entries
    const newEntries = userEntries.map(r => [...r]);
    
    // Remove from incorrect cells if this cell was marked incorrect
    const newIncorrectCells = incorrectCells.filter(
      cell => !(cell[0] === row && cell[1] === col)
    );
    
    // Clear the cell
    newEntries[row][col] = null;
    
    // Save to history before updating the state
    saveToHistory(newEntries, gameState.mistakes, newIncorrectCells, notes);
    
    // Update the state
    setUserEntries(newEntries);
    setIncorrectCells(newIncorrectCells);
  };

  // Add a handler for the hint feature
  const handleHint = () => {
    // Check if hints are available
    if (gameState.hintsRemaining <= 0) {
      console.log("No hints remaining");
      setHintMessage("No hints remaining");
      setTimeout(() => setHintMessage(''), 3000);
      return;
    }
    
    // Check if a cell is selected
    if (!selectedCell) {
      console.log("No cell selected");
      setHintMessage("Select a cell first to get a hint");
      setTimeout(() => setHintMessage(''), 3000);
      return;
    }
    
    // Check if puzzle and solution are available
    if (!puzzle || !solution || !userEntries) {
      console.log("Puzzle, solution, or user entries not available");
      return;
    }
    
    const [row, col] = selectedCell;
    
    // Don't provide hint for cells that were part of the initial puzzle
    if (puzzle[row][col] !== null) {
      setHintMessage("This cell is already filled");
      setTimeout(() => setHintMessage(''), 3000);
      return;
    }
    
    // Don't provide hint if the cell already has the correct value
    if (userEntries[row][col] === solution[row][col]) {
      setHintMessage("This cell is already correct");
      setTimeout(() => setHintMessage(''), 3000);
      return;
    }
    
    // Get the correct value from the solution
    const correctValue = solution[row][col];
    
    // Create a copy of the user entries and update with the hint value
    const newEntries = userEntries.map(r => [...r]);
    newEntries[row][col] = correctValue;
    
    // Track this cell as a hint cell
    const newHintCells = [...hintCells, [row, col]];
    setHintCells(newHintCells);
    
    // Clear any notes for this cell
    const newNotes = [...notes];
    newNotes[row][col] = [];
    setNotes(newNotes);
    
    // Create a snapshot for history
    saveToHistory(
      newEntries,
      gameState.mistakes,
      incorrectCells,
      newNotes
    );
    
    // Show hint message
    setHintMessage(`Revealed value: ${correctValue}`);
    setTimeout(() => setHintMessage(''), 3000);
    
    // Update the state
    setUserEntries(newEntries);
    setGameState(prev => ({
      ...prev,
      hintsRemaining: prev.hintsRemaining - 1
    }));
    
    // Check if the puzzle is now completed
    checkCompletion(newEntries);
    
    // Update number counts
    const newCounts = [...numberCounts];
    newCounts[correctValue]--;
    setNumberCounts(newCounts);
  };

  // Add a toggle function for note mode
  const toggleNoteMode = () => {
    setIsNoteMode(!isNoteMode);
  };

  // Update the numberCounts when the puzzle is generated
  useEffect(() => {
    if (puzzle) {
      updateNumberCounts(puzzle, userEntries);
    }
  }, [puzzle, userEntries]);

  // Function to update the number counts
  const updateNumberCounts = (puzzleGrid, userGrid) => {
    // Start with all 9s (each number can appear exactly 9 times in a completed grid)
    const counts = Array(10).fill(9);
    
    // Count numbers in the puzzle
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzleGrid[row][col] !== null) {
          counts[puzzleGrid[row][col]]--;
        }
      }
    }
    
    // Count numbers in user entries
    if (userGrid) {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (userGrid[row][col] !== null) {
            counts[userGrid[row][col]]--;
          }
        }
      }
    }
    
    setNumberCounts(counts);
  };

  // Add a function to generate a new game
  const handleNewGame = () => {
    // Increment the refresh trigger to force puzzle regeneration
    setRefreshTrigger(prev => prev + 1);
  };

  // Add a timer effect to track elapsed time
  useEffect(() => {
    let timerInterval = null;
    
    // Start the timer if the game is active and not completed or game over
    if (gameState.isActive && !gameState.isCompleted && !gameState.isGameOver) {
      timerInterval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1
        }));
      }, 1000);
    }
    
    // Clean up interval on unmount or when game state changes
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [gameState.isActive, gameState.isCompleted, gameState.isGameOver]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      <Navbar currentMode={currentMode} setCurrentMode={setCurrentMode} />
      
      <div className="game-layout">
        {/* Controls panel */}
        <aside className="controls-panel">
          <div className="panel-section">
            <h2 className="section-title">Game Settings</h2>
            <DifficultySelector 
              currentMode={currentMode}
              currentDifficulty={currentDifficulty}
              setCurrentDifficulty={setCurrentDifficulty}
            />
          </div>
          
          <div className="panel-section">
            <h2 className="section-title">Statistics</h2>
            <div className="stats-container">
              <div className="mistakes-display">
                <span className="mistakes-label">Mistakes:</span>
                <span className={`mistakes-value ${gameState.mistakes > 0 ? 'has-mistakes' : ''}`}>
                  {gameState.mistakes}/3
                </span>
              </div>
              <div className="hints-display">
                <span className="hints-label">Hints:</span>
                <span className="hints-value">
                  {gameState.hintsRemaining}/3
                </span>
              </div>
            </div>
            <div className="side-ad-container">
              <AdComponent slot="0987654321" style={{ height: '250px', width: '300px', maxWidth: '100%', margin: '15px auto 0' }} />
            </div>
          </div>
        </aside>
        
        {/* Main game area */}
        <main className="game-area">
          <div className="game-header">
            <h1>Sudoku - {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}</h1>
            <div className="game-info">
              <span>Difficulty: {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}</span>
              <span className="timer-display">Time: {formatTime(gameState.elapsedTime)}</span>
            </div>
          </div>
          
          <div className="game-play-area">
            <div className="game-board">
              {currentMode === 'classic' && puzzle && userEntries ? (
                <Board 
                  puzzle={puzzle} 
                  userEntries={userEntries}
                  selectedNumber={selectedNumber}
                  selectedCell={selectedCell}
                  incorrectCells={incorrectCells}
                  hintCells={hintCells}
                  notes={notes}
                  highlightedNumber={highlightedNumber}
                  onCellSelect={handleCellSelect}
                  onClearCell={handleClearCell}
                />
              ) : currentMode === 'killer' && puzzle && userEntries ? (
                <KillerBoard 
                  puzzle={puzzle}
                  userEntries={userEntries}
                  cages={cages}
                  selectedNumber={selectedNumber}
                  selectedCell={selectedCell}
                  incorrectCells={incorrectCells}
                  hintCells={hintCells}
                  notes={notes}
                  highlightedNumber={highlightedNumber}
                  onCellSelect={handleCellSelect}
                  onClearCell={handleClearCell}
                />
              ) : (
                <p>Game board for {currentMode} mode at {currentDifficulty} difficulty</p>
              )}
            </div>
            
            {(currentMode === 'classic' || currentMode === 'killer') && (
              <NumberPad 
                onNumberSelect={handleNumberSelect}
                onErase={handleErase}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onReset={handleReset}
                onHint={handleHint}
                onToggleNoteMode={toggleNoteMode}
                isNoteMode={isNoteMode}
                hintsRemaining={gameState.hintsRemaining}
                selectedNumber={selectedNumber}
                numberCounts={numberCounts}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
              />
            )}
          </div>
          
          {gameState.isCompleted && (
            <div className="completion-message">
              <h2>Puzzle Completed!</h2>
              <p>Time: {formatTime(gameState.elapsedTime)}</p>
              <p>Mistakes: {gameState.mistakes}/3</p>
              <p>Hints used: {3 - gameState.hintsRemaining}/3</p>
              <div className="completion-actions">
                <button onClick={handleNewGame}>New Game</button>
                <button onClick={handleReset}>Reset Puzzle</button>
              </div>
            </div>
          )}
          
          {gameState.isGameOver && !gameState.isCompleted && (
            <div className="completion-message game-over">
              <h2>Game Over!</h2>
              <p>You've made 3 mistakes</p>
              <p>Time: {formatTime(gameState.elapsedTime)}</p>
              <div className="completion-actions">
                <button onClick={handleNewGame}>New Game</button>
                <button onClick={handleReset}>Try Again</button>
              </div>
            </div>
          )}
          
          {/* Add a helper message when hints are available but no cell is selected */}
          {gameState.hintsRemaining > 0 && !selectedCell && !gameState.isCompleted && !gameState.isGameOver && (
            <div className="hint-helper">
              Select an empty cell and click the Hint button to get help
            </div>
          )}
          
          {/* Add hint message to the UI */}
          {hintMessage && (
            <div className="hint-message">
              <span className="hint-icon">💡</span> {hintMessage}
            </div>
          )}
        </main>
        
        {/* New right-side ad container */}
        <aside className="right-ad-panel">
          <div className="right-ad-container">
            <AdComponent 
              slot="9988776655" 
              style={{ height: '600px', width: '160px', maxWidth: '100%', margin: '0 auto' }} 
            />
          </div>
        </aside>
      </div>
      
      <div className="bottom-ad-container">
        <AdComponent slot="1122334455" style={{ height: '90px', width: '728px', maxWidth: '100%', margin: '20px auto' }} />
      </div>
      
      {showCompletionAd && (
        <div className="fullscreen-ad-overlay">
          <div className="fullscreen-ad-container">
            <button 
              className="close-ad-button" 
              onClick={() => setShowCompletionAd(false)}
            >
              Skip Ad
            </button>
            <AdComponent 
              slot="5566778899" 
              format="rectangle" 
              style={{ width: '336px', height: '280px' }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
