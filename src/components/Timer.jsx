import React, { useState, useEffect } from 'react';
import '../styles/Timer.css';

function Timer({ isRunning, onTimeUpdate, gameId }) {
  // Store seconds in state
  const [seconds, setSeconds] = useState(0);
  
  // Reset timer when gameId changes
  useEffect(() => {
    console.log('Timer reset due to gameId change');
    setSeconds(0);
    if (onTimeUpdate) onTimeUpdate(0);
  }, [gameId, onTimeUpdate]);
  
  // Handle timer running state
  useEffect(() => {
    console.log('Timer running state changed:', isRunning);
    let timerInterval = null;
    
    if (isRunning) {
      timerInterval = setInterval(() => {
        setSeconds(prev => {
          const newValue = prev + 1;
          if (onTimeUpdate) onTimeUpdate(newValue);
          return newValue;
        });
      }, 1000);
      
      console.log('Timer started');
    }
    
    // Cleanup function
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        console.log('Timer interval cleared');
      }
    };
  }, [isRunning, onTimeUpdate]);
  
  // Format time as mm:ss
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="timer">
      <span className="timer-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
          <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"/>
        </svg>
      </span>
      <span className="timer-value">{formatTime(seconds)}</span>
    </div>
  );
}

export default Timer; 