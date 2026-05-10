import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onLoadingComplete, logoText = "RUFUS MACBA" }) => {
  const [phase, setPhase] = useState('initial'); // initial, expanding, transitioning, shrinking, complete

  useEffect(() => {
    // Phase 1: Initial display with logo (longer display)
    const expandTimer = setTimeout(() => {
      setPhase('expanding');
    }, 2500);

    // Phase 2: Logo expands/pulses
    const transitionTimer = setTimeout(() => {
      setPhase('transitioning');
    }, 4000);

    // Phase 3: Logo moves to navbar position and screen slides up
    const shrinkTimer = setTimeout(() => {
      setPhase('shrinking');
    }, 5500);

    // Phase 4: Complete - notify parent
    const completeTimer = setTimeout(() => {
      setPhase('complete');
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 6500);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(transitionTimer);
      clearTimeout(shrinkTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div className={`loading-screen-wrapper ${phase}`}>
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-logo-container">
            <div className="loading-logo">
              <img src="/Logo.png" alt="Rufus Macba" className="logo-image" />
            </div>
            <div className="loading-line"></div>
          </div>
        </div>
      </div>
      <div className="loading-reveal-top"></div>
      <div className="loading-reveal-bottom"></div>
    </div>
  );
};

export default LoadingScreen;
