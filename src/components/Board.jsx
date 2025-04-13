import React from 'react';
import Cell from './Cell';
import '../styles/Board.css';

function Board({ 
  puzzle, 
  userEntries, 
  selectedNumber, 
  selectedCell, 
  incorrectCells, 
  hintCells = [],
  notes = Array(9).fill().map(() => Array(9).fill().map(() => [])),
  onCellSelect,
  onClearCell
}) {
  // Handle cell click
  const handleCellClick = (rowIndex, colIndex) => {
    // Report the selected cell to parent
    if (onCellSelect) {
      onCellSelect(rowIndex, colIndex);
    }
  };

  // Get the value of a cell (either from puzzle or user entries)
  const getCellValue = (rowIndex, colIndex) => {
    // If it's part of the initial puzzle, return that value
    if (puzzle[rowIndex][colIndex] !== null) {
      return puzzle[rowIndex][colIndex];
    }
    
    // Otherwise, return the user entry (if any)
    return userEntries ? userEntries[rowIndex][colIndex] : null;
  };

  // Check if a cell is selected
  const isCellSelected = (rowIndex, colIndex) => {
    return selectedCell && 
           selectedCell[0] === rowIndex && 
           selectedCell[1] === colIndex;
  };
  
  // Check if a value was provided in the initial puzzle (not user-entered)
  const isInitialValue = (rowIndex, colIndex) => {
    return puzzle && puzzle[rowIndex][colIndex] !== null;
  };
  
  // Check if a cell contains an incorrect entry
  const isIncorrect = (rowIndex, colIndex) => {
    return incorrectCells && 
           incorrectCells.some(cell => cell[0] === rowIndex && cell[1] === colIndex);
  };
  
  // Check if a cell was filled with a hint
  const isHintCell = (rowIndex, colIndex) => {
    return hintCells.some(cell => cell[0] === rowIndex && cell[1] === colIndex);
  };

  // Check if a cell contains the same number as the selected cell
  const isHighlightedNumber = (rowIndex, colIndex) => {
    if (!selectedCell) return false;
    
    const [selRow, selCol] = selectedCell;
    const selectedValue = getCellValue(selRow, selCol);
    
    if (!selectedValue) return false;
    
    const currentValue = getCellValue(rowIndex, colIndex);
    return currentValue === selectedValue && !isCellSelected(rowIndex, colIndex);
  };
  
  // Check if a cell is in the same row as the selected cell
  const isHighlightedRow = (rowIndex, colIndex) => {
    if (!selectedCell) return false;
    return selectedCell[0] === rowIndex && !isCellSelected(rowIndex, colIndex);
  };
  
  // Check if a cell is in the same column as the selected cell
  const isHighlightedColumn = (rowIndex, colIndex) => {
    if (!selectedCell) return false;
    return selectedCell[1] === colIndex && !isCellSelected(rowIndex, colIndex);
  };
  
  // Check if a cell is in the same 3x3 box as the selected cell
  const isHighlightedBox = (rowIndex, colIndex) => {
    if (!selectedCell) return false;
    
    const [selRow, selCol] = selectedCell;
    
    // Get box coordinates (0-2)
    const selBoxRow = Math.floor(selRow / 3);
    const selBoxCol = Math.floor(selCol / 3);
    
    const cellBoxRow = Math.floor(rowIndex / 3);
    const cellBoxCol = Math.floor(colIndex / 3);
    
    return selBoxRow === cellBoxRow && 
           selBoxCol === cellBoxCol && 
           !isCellSelected(rowIndex, colIndex);
  };

  return (
    <div className="sudoku-board">
      {puzzle.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="board-row">
          {row.map((_, colIndex) => (
            <Cell
              key={`cell-${rowIndex}-${colIndex}`}
              rowIndex={rowIndex}
              colIndex={colIndex}
              value={getCellValue(rowIndex, colIndex)}
              notes={notes[rowIndex][colIndex]}
              isInitial={isInitialValue(rowIndex, colIndex)}
              isSelected={isCellSelected(rowIndex, colIndex)}
              isIncorrect={isIncorrect(rowIndex, colIndex)}
              isHint={isHintCell(rowIndex, colIndex)}
              isHighlightedNumber={isHighlightedNumber(rowIndex, colIndex)}
              isHighlightedRow={isHighlightedRow(rowIndex, colIndex)}
              isHighlightedColumn={isHighlightedColumn(rowIndex, colIndex)}
              isHighlightedBox={isHighlightedBox(rowIndex, colIndex)}
              onCellClick={handleCellClick}
              onClearCell={onClearCell}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board; 