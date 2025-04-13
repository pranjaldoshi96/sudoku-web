/**
 * Enhanced Sudoku solver that implements standard solving techniques
 * to provide meaningful hints
 */

// Find a logical next move based on various solving techniques
export function findNextHint(puzzle, userEntries, solution) {
  // Create a combined grid of the current state
  const currentGrid = puzzle.map((row, i) => 
    row.map((cell, j) => cell !== null ? cell : (userEntries[i][j] || null))
  );
  
  // 1. First, check for naked singles - cells with only one possible value
  const nakedSingle = findNakedSingle(currentGrid);
  if (nakedSingle) {
    return {
      row: nakedSingle.row,
      col: nakedSingle.col,
      value: nakedSingle.value,
      strategy: "Single Candidate: This cell can only contain one value"
    };
  }
  
  // 2. Check for hidden singles in rows, columns, and boxes
  const hiddenSingle = findHiddenSingle(currentGrid);
  if (hiddenSingle) {
    return {
      row: hiddenSingle.row,
      col: hiddenSingle.col,
      value: hiddenSingle.value,
      strategy: `Hidden Single: Only this cell in its ${hiddenSingle.unit} can contain ${hiddenSingle.value}`
    };
  }
  
  // 3. If no obvious next moves, find the most constrained empty cell
  const constrainedCell = findMostConstrainedCell(currentGrid);
  if (constrainedCell) {
    const { row, col } = constrainedCell;
    
    // Get the correct value from the solution
    if (solution && solution[row][col]) {
      return {
        row,
        col,
        value: solution[row][col],
        strategy: "Look for intersections: Check which values are possible in this cell"
      };
    }
  }
  
  // If we get here, we couldn't find a logical next move
  // This shouldn't happen with a valid puzzle, but just in case
  return findAnyEmptyCell(currentGrid, solution);
}

// Find a cell that can only contain one value (naked single)
function findNakedSingle(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const candidates = findCandidates(grid, row, col);
        
        if (candidates.length === 1) {
          return {
            row,
            col,
            value: candidates[0]
          };
        }
      }
    }
  }
  
  return null;
}

// Find candidate values for a cell
function findCandidates(grid, row, col) {
  const candidates = [];
  
  for (let num = 1; num <= 9; num++) {
    if (isValidCandidate(grid, row, col, num)) {
      candidates.push(num);
    }
  }
  
  return candidates;
}

// Check if a number is a valid candidate for a cell
function isValidCandidate(grid, row, col, num) {
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

// Find a value that can only go in one cell in a row, column, or box (hidden single)
function findHiddenSingle(grid) {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const hiddenSingle = findHiddenSingleInUnit(grid, "row", row);
    if (hiddenSingle) {
      return {
        ...hiddenSingle,
        unit: "row"
      };
    }
  }
  
  // Check columns
  for (let col = 0; col < 9; col++) {
    const hiddenSingle = findHiddenSingleInUnit(grid, "column", col);
    if (hiddenSingle) {
      return {
        ...hiddenSingle,
        unit: "column"
      };
    }
  }
  
  // Check boxes
  for (let box = 0; box < 9; box++) {
    const hiddenSingle = findHiddenSingleInUnit(grid, "box", box);
    if (hiddenSingle) {
      return {
        ...hiddenSingle,
        unit: "3x3 box"
      };
    }
  }
  
  return null;
}

// Find a hidden single in a specific unit (row, column, or box)
function findHiddenSingleInUnit(grid, unitType, unitIndex) {
  // Get all empty cells in the unit
  const emptyCells = [];
  
  // For each possible value 1-9, count occurrences and positions
  for (let num = 1; num <= 9; num++) {
    let positions = [];
    
    if (unitType === "row") {
      // Check a row
      for (let col = 0; col < 9; col++) {
        if (grid[unitIndex][col] === null && isValidCandidate(grid, unitIndex, col, num)) {
          positions.push({ row: unitIndex, col });
        }
      }
    } else if (unitType === "column") {
      // Check a column
      for (let row = 0; row < 9; row++) {
        if (grid[row][unitIndex] === null && isValidCandidate(grid, row, unitIndex, num)) {
          positions.push({ row, col: unitIndex });
        }
      }
    } else if (unitType === "box") {
      // Check a 3x3 box
      const boxRow = Math.floor(unitIndex / 3) * 3;
      const boxCol = (unitIndex % 3) * 3;
      
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = boxRow + r;
          const col = boxCol + c;
          
          if (grid[row][col] === null && isValidCandidate(grid, row, col, num)) {
            positions.push({ row, col });
          }
        }
      }
    }
    
    // If this value can only go in one position in this unit, it's a hidden single
    if (positions.length === 1) {
      return {
        row: positions[0].row,
        col: positions[0].col,
        value: num
      };
    }
  }
  
  return null;
}

// Find the most constrained empty cell (cell with fewest candidates)
function findMostConstrainedCell(grid) {
  let minCandidates = 10; // More than the maximum possible
  let bestCell = null;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const candidates = findCandidates(grid, row, col);
        
        if (candidates.length < minCandidates) {
          minCandidates = candidates.length;
          bestCell = { row, col, candidates };
        }
      }
    }
  }
  
  return bestCell;
}

// Fallback: Find any empty cell
function findAnyEmptyCell(grid, solution) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        return {
          row,
          col,
          value: solution[row][col],
          strategy: "Try this cell based on the solution"
        };
      }
    }
  }
  
  return null; // No empty cells
}

// Export a function to validate the current state of the puzzle
export function validatePuzzleState(grid) {
  // Check each row, column, and box for duplicate values
  for (let i = 0; i < 9; i++) {
    // Check row
    const rowValues = new Set();
    for (let col = 0; col < 9; col++) {
      const value = grid[i][col];
      if (value !== null) {
        if (rowValues.has(value)) return false;
        rowValues.add(value);
      }
    }
    
    // Check column
    const colValues = new Set();
    for (let row = 0; row < 9; row++) {
      const value = grid[row][i];
      if (value !== null) {
        if (colValues.has(value)) return false;
        colValues.add(value);
      }
    }
    
    // Check box
    const boxValues = new Set();
    const boxRow = Math.floor(i / 3) * 3;
    const boxCol = (i % 3) * 3;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const value = grid[boxRow + r][boxCol + c];
        if (value !== null) {
          if (boxValues.has(value)) return false;
          boxValues.add(value);
        }
      }
    }
  }
  
  return true;
} 