import React from 'react';
import '../styles/Cell.css';

function Cell({ 
  rowIndex, 
  colIndex, 
  value, 
  notes = [],
  isInitial, 
  isSelected, 
  isIncorrect,
  isHint,
  isHighlightedNumber,
  isHighlightedRow,
  isHighlightedColumn,
  isHighlightedBox, 
  onCellClick, 
  onClearCell 
}) {
  // Determine cell position for proper border styling
  const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex < 8;
  const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex < 8;
  
  // Build class names based on cell state
  const cellClasses = [
    'cell',
    isRightBorder ? 'right-border' : '',
    isBottomBorder ? 'bottom-border' : '',
    isInitial ? 'initial' : '',
    !isInitial && value ? 'user-entry' : '',
    isIncorrect ? 'incorrect' : '',
    isHint ? 'hint' : '',
    isHighlightedNumber ? 'highlight-number' : '',
    isHighlightedRow ? 'highlight-row' : '',
    isHighlightedColumn ? 'highlight-column' : '',
    isHighlightedBox ? 'highlight-box' : '',
    isSelected ? 'selected' : ''
  ].filter(Boolean).join(' ');
  
  // Handle clear button click
  const handleClearClick = (e) => {
    e.stopPropagation(); // Prevent triggering cell click
    if (onClearCell) {
      onClearCell(rowIndex, colIndex);
    }
  };
  
  return (
    <div 
      className={cellClasses}
      data-row={rowIndex}
      data-col={colIndex}
      onClick={() => onCellClick(rowIndex, colIndex)} // Allow all cells to be selected
    >
      {/* Show either value or notes */}
      {value ? (
        <span className="cell-value">{value}</span>
      ) : (
        <div className="notes-container">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <div 
              key={num} 
              className={`note-item ${notes.includes(num) ? 'has-note' : ''}`}
            >
              {notes.includes(num) ? num : ''}
            </div>
          ))}
        </div>
      )}
      
      {/* Show clear button only for user-entered values */}
      {!isInitial && value && (
        <button 
          className="cell-clear-btn"
          onClick={handleClearClick}
          title="Clear cell"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Cell; 