import React from 'react';
import Cell from './Cell';
import '../styles/Board.css';
import '../styles/KillerSudoku.css';

function KillerBoard({ 
  puzzle, 
  userEntries, 
  cages,
  selectedNumber, 
  selectedCell, 
  incorrectCells, 
  hintCells = [],
  notes = Array(9).fill().map(() => Array(9).fill().map(() => [])),
  highlightedNumber = null,
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

  // Check if a cell contains the same number as the selected cell or highlighted number
  const isHighlightedNumber = (rowIndex, colIndex) => {
    // First check if a number is directly highlighted from number pad
    const value = getCellValue(rowIndex, colIndex);
    if (highlightedNumber !== null && value === highlightedNumber) {
      return true;
    }
    
    // Otherwise check if it matches the selected cell's value
    if (!selectedCell) return false;
    
    const [selRow, selCol] = selectedCell;
    const selectedValue = getCellValue(selRow, selCol);
    
    if (!selectedValue) return false;
    
    return value === selectedValue && !isCellSelected(rowIndex, colIndex);
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
  
  // Determine cage info for a cell
  const getCellCageInfo = (rowIndex, colIndex) => {
    if (!cages) return null;
    
    // Find which cage this cell belongs to
    const cage = cages.find(cage => 
      cage.cells.some(([r, c]) => r === rowIndex && c === colIndex)
    );
    
    if (!cage) return null;
    
    // Determine cage boundaries - which sides of this cell have borders
    const hasTopBorder = !cage.cells.some(([r, c]) => r === rowIndex - 1 && c === colIndex);
    const hasRightBorder = !cage.cells.some(([r, c]) => r === rowIndex && c === colIndex + 1);
    const hasBottomBorder = !cage.cells.some(([r, c]) => r === rowIndex + 1 && c === colIndex);
    const hasLeftBorder = !cage.cells.some(([r, c]) => r === rowIndex && c === colIndex - 1);
    
    // Determine if this cell should show the cage sum (top-left cell in cage)
    const isTopLeftInCage = cage.cells.every(([r, c]) => 
      r > rowIndex || (r === rowIndex && c >= colIndex)
    );
    
    return {
      cageId: cage.id,
      sum: cage.sum,
      borders: {
        top: hasTopBorder,
        right: hasRightBorder,
        bottom: hasBottomBorder,
        left: hasLeftBorder
      },
      showSum: isTopLeftInCage
    };
  };

  return (
    <div className="sudoku-board killer-board">
      {puzzle.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="board-row">
          {row.map((_, colIndex) => {
            const cageInfo = getCellCageInfo(rowIndex, colIndex);
            const cageClass = cageInfo ? `killer-cage killer-cage-color-${cageInfo.cageId % 9 + 1}` : '';
            
            return (
              <div 
                key={`cell-container-${rowIndex}-${colIndex}`}
                className={`cell-container ${cageClass}`}
              >
                {cageInfo && (
                  <>
                    {cageInfo.borders.top && <div className="cage-border-top"></div>}
                    {cageInfo.borders.right && <div className="cage-border-right"></div>}
                    {cageInfo.borders.bottom && <div className="cage-border-bottom"></div>}
                    {cageInfo.borders.left && <div className="cage-border-left"></div>}
                    {cageInfo.showSum && <div className="cage-sum">{cageInfo.sum}</div>}
                  </>
                )}
                
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
                  isKiller={true}
                  onCellClick={handleCellClick}
                  onClearCell={onClearCell}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default KillerBoard; 