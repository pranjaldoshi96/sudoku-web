/**
 * Sudoku puzzle generator
 * Difficulty levels determine how many cells are revealed:
 * - Easy: 35-40 revealed cells
 * - Medium: 30-34 revealed cells
 * - Hard: 25-29 revealed cells
 * - Expert: 22-24 revealed cells
 * - Master: 20-21 revealed cells
 * - Extreme: 17-19 revealed cells (minimum required for unique solution)
 */

// Maps difficulty levels to ranges of cells to reveal
const DIFFICULTY_LEVELS = {
  easy: { min: 35, max: 40 },
  medium: { min: 30, max: 34 },
  hard: { min: 25, max: 29 },
  expert: { min: 22, max: 24 },
  master: { min: 20, max: 21 },
  extreme: { min: 17, max: 19 }
};

/**
 * Enhanced Sudoku puzzle generator using backtracking and proper difficulty metrics
 */

// Generate a complete valid Sudoku solution
function generateSolvedGrid() {
  // Start with empty grid
  const grid = Array(9).fill().map(() => Array(9).fill(null));
  
  // Fill the grid using backtracking
  if (solveGrid(grid)) {
    return grid;
  }
  
  // This shouldn't happen with a proper implementation
  console.error("Failed to generate a solved grid");
  return Array(9).fill().map(() => Array(9).fill(1)); // Fallback
}

// Backtracking solver
function solveGrid(grid) {
  // Find an empty cell
  const emptyCell = findEmptyCell(grid);
  
  // If no empty cell is found, the grid is solved
  if (!emptyCell) return true;
  
  const [row, col] = emptyCell;
  
  // Try each number 1-9
  const numbers = getShuffledNumbers();
  
  for (let num of numbers) {
    // Check if the number is valid in this position
    if (isValidPlacement(grid, row, col, num)) {
      // Place the number
      grid[row][col] = num;
      
      // Recursively try to solve the rest of the grid
      if (solveGrid(grid)) {
        return true;
      }
      
      // If we get here, the solution didn't work; reset and try next number
      grid[row][col] = null;
    }
  }
  
  // No solution found with current configuration
  return false;
}

// Helper function to find an empty cell
function findEmptyCell(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        return [row, col];
      }
    }
  }
  return null; // No empty cells
}

// Helper function to check if a number can be placed at position
function isValidPlacement(grid, row, col, num) {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[boxRow + r][boxCol + c] === num) return false;
    }
  }
  
  return true;
}

// Helper function to get shuffled array of numbers 1-9
function getShuffledNumbers() {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  return numbers;
}

// Create a puzzle by removing numbers from the solved grid
function createPuzzleFromSolution(solution, difficulty) {
  // Make a deep copy of the solution
  const puzzle = solution.map(row => [...row]);
  
  // Determine how many cells to remove based on difficulty
  let cellsToRemove;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 40; // Leave ~41 clues
      break;
    case 'medium':
      cellsToRemove = 50; // Leave ~31 clues
      break;
    case 'hard':
      cellsToRemove = 55; // Leave ~26 clues
      break;
    case 'expert':
      cellsToRemove = 60; // Leave ~21 clues
      break;
    default:
      cellsToRemove = 45;
  }
  
  // Get all positions in the grid
  const positions = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }
  
  // Shuffle the positions to remove cells randomly
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove cells one by one, checking for uniqueness
  let removed = 0;
  
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;
    
    const valueToRemove = puzzle[row][col];
    puzzle[row][col] = null;
    
    // Check if the puzzle still has a unique solution
    if (!hasUniqueSolution(puzzle, solution)) {
      // If not, put the value back
      puzzle[row][col] = valueToRemove;
    } else {
      removed++;
    }
  }
  
  return puzzle;
}

// Check if the puzzle has a unique solution
function hasUniqueSolution(puzzle, expectedSolution) {
  // Create a copy of the puzzle
  const puzzleCopy = puzzle.map(row => [...row]);
  
  // Count solutions (with early exit at > 1)
  let solutionCount = 0;
  const solutions = [];
  
  countSolutions(puzzleCopy, 0, 0, solutions);
  
  // We just need to know if there's exactly one solution
  return solutions.length === 1;
}

// Count solutions (with early exit at > 1)
function countSolutions(grid, row, col, solutions) {
  // If we've processed the entire grid, we found a solution
  if (row === 9) {
    solutions.push(grid.map(row => [...row]));
    return solutions.length <= 1; // Early exit if we already have >1 solution
  }
  
  // Move to the next cell
  const nextRow = col === 8 ? row + 1 : row;
  const nextCol = col === 8 ? 0 : col + 1;
  
  // If this cell is already filled, move to the next one
  if (grid[row][col] !== null) {
    return countSolutions(grid, nextRow, nextCol, solutions);
  }
  
  // Try each possible number
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(grid, row, col, num)) {
      grid[row][col] = num;
      
      // Recursively count solutions for the next cell
      const shouldContinue = countSolutions(grid, nextRow, nextCol, solutions);
      
      // Reset the cell
      grid[row][col] = null;
      
      // Early exit if we have >1 solution
      if (!shouldContinue) return false;
    }
  }
  
  return solutions.length <= 1;
}

// Main function to generate a puzzle with the specified difficulty
export function generatePuzzle(difficulty = 'medium') {
  // Generate a solved Sudoku grid
  const solution = generateSolvedGrid();
  
  // Create a puzzle from the solution
  const puzzle = createPuzzleFromSolution(solution, difficulty);
  
  return { puzzle, solution };
}

// Helper function to check if a puzzle is solvable and has a unique solution
export function validatePuzzle(puzzle) {
  // Count the number of filled cells
  let filledCells = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] !== null) {
        filledCells++;
      }
    }
  }
  
  // Too few clues - minimum theoretical number for unique solution is 17
  if (filledCells < 17) {
    return { valid: false, reason: "Too few clues for a unique solution" };
  }
  
  // Check if the initial puzzle is valid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = puzzle[row][col];
      
      if (value !== null) {
        // Temporarily remove the value and check if it's valid
        puzzle[row][col] = null;
        const isValid = isValidPlacement(puzzle, row, col, value);
        puzzle[row][col] = value;
        
        if (!isValid) {
          return { valid: false, reason: "Invalid initial placement" };
        }
      }
    }
  }
  
  // Try to solve and count solutions
  const solutions = [];
  const puzzleCopy = puzzle.map(row => [...row]);
  countSolutions(puzzleCopy, 0, 0, solutions);
  
  if (solutions.length === 0) {
    return { valid: false, reason: "No solution exists" };
  }
  
  if (solutions.length > 1) {
    return { valid: false, reason: "Multiple solutions exist" };
  }
  
  return { valid: true, solution: solutions[0] };
} 