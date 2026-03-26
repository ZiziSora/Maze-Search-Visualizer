import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import React from "react";
import MazeGenerator from './components/MazeGenerator';
import { generateMaze, solveAndAnimate, drawMaze } from './components/MazeGenerator';
import './style.css';

export default function App() {
  const mazeRef = useRef(null);
  const animationTimerRef = useRef(null);
  const progressRef = useRef(0);
  const stepsRef = useRef([]);

  const [cellCount, setCellCount] = useState(21);
  const [density, setDensity] = useState(0.18);
  const [seed, setSeed] = useState(Date.now());
  const [speed, setSpeed] = useState(10);
  const [isSolving, setIsSolving] = useState(false);

  const [progress, setProgress] = useState(0);

  const grid = useMemo(
    () => generateMaze(cellCount, density, seed),
    [cellCount, density, seed]
  );

  const resetProgress = useCallback(() => {
    progressRef.current = 0;
    stepsRef.current = [];
    setProgress(0);
  }, []);

  // Stop animation and reset when the maze changes (new seed, size, or density).
  useEffect(() => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
      setIsSolving(false);
    }
    resetProgress();
  }, [grid, resetProgress]);

  // Sync progress state every 200ms while animating so the UI stays accurate.
  useEffect(() => {
    if (!isSolving) return;
    const syncId = setInterval(() => {
      setProgress(progressRef.current);
    }, 200);
    return () => clearInterval(syncId);
  }, [isSolving]);

  const handleReset = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    setIsSolving(false);
    resetProgress();

    // Redraw the clean maze over the animation overlay.
    const canvas = mazeRef.current;
    if (canvas) {
      drawMaze(canvas.getContext("2d"), grid);
    }
  };

  const handleToggleSolve = () => {
    if (isSolving) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
      setIsSolving(false);
    } else {
      // If animation already finished, restart from scratch.
      if (stepsRef.current.length > 0 && progressRef.current >= stepsRef.current.length) {
        progressRef.current = 0;
        setProgress(0);
      }

      const timerId = solveAndAnimate(
        'DFS',
        grid,
        mazeRef.current,
        progressRef,
        stepsRef,
        speed,
        () => {
          setIsSolving(false);
          setProgress(progressRef.current);
        }
      );
      animationTimerRef.current = timerId;
      setIsSolving(true);
    }
  };

  const hasStarted = progress > 0 || stepsRef.current.length > 0;
  const isFinished = stepsRef.current.length > 0 && progress >= stepsRef.current.length;
  const isPaused = !isSolving && progress > 0 && !isFinished;

  const solveLabel = isSolving ? "Pause" : isPaused ? "Continue" : "Run DFS";

  return (
    <>
      <div className="panel_left">
        <p>Grid Size: {cellCount * 2 - 1} x {cellCount * 2 - 1}</p>
        <input
          type="range" min="5" max="51" step="2"
          value={cellCount}
          onChange={(e) => setCellCount(Number(e.target.value))}
        />

        <p>Searching speed: {speed}</p>
        <input
          disabled={hasStarted}
          type="range" min="5" max="51" step="1"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />

        <p>Swamp density: {density}</p>
        <input
          type="range" min="0.01" max="0.50" step="0.01"
          value={density}
          onChange={(e) => setDensity(Number(e.target.value))}
        />

        <button onClick={() => setSeed(Date.now())}>
          Generate Maze
        </button>

        <button onClick={handleToggleSolve}>
          {solveLabel}
        </button>

        <button onClick={handleReset} disabled={!hasStarted}>
          Reset
        </button>
      </div>

      <div className="center_content">
        <MazeGenerator ref={mazeRef} grid={grid} />
      </div>

      <div className="panel_right">
        <h3>Legend</h3>
      </div>
    </>
  );
}