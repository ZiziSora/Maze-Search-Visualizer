import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import React from "react";
import MazeGenerator from './components/MazeGenerator';
import { generateMaze, solveAndAnimate, drawMaze } from './components/MazeGenerator';
import { benchmarkMaps } from './components/MapGenerator';
import './style.css';

export default function App() {
  const mazeRef            = useRef(null);
  const animationTimerRef  = useRef(null);
  const progressRef        = useRef(0);
  const stepsRef           = useRef([]);

  const [cellCount, setCellCount] = useState(21);
  const [density,   setDensity]   = useState(0.18);
  const [seed,      setSeed]      = useState(Date.now());
  const [speed,     setSpeed]     = useState(26);   // mid-range default
  const [isSolving, setIsSolving] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [stats,     setStats]     = useState(null);  // { visitedCount, pathCost }
  const [selected, setSelected] = useState('DFS');
  const [mapIndex, setMapIndex] = useState(0);

  const currentMap = benchmarkMaps[mapIndex];

  const grid = useMemo(() => {
    return currentMap.grid ? currentMap.grid : generateMaze(cellCount, density, seed);
  }, [mapIndex, cellCount, density, seed]);

  const startNode = useMemo(() => currentMap.start ? currentMap.start : [1, 1], [currentMap, grid]);
  const targetNode = useMemo(() => currentMap.goal ? currentMap.goal : [grid.length - 2, grid[0].length - 2], [currentMap, grid]);

  const resetProgress = useCallback(() => {
    progressRef.current = 0;
    stepsRef.current    = [];
    setProgress(0);
    setStats(null);
  }, []);

  // When grid changes: kill any running animation and reset everything
  useEffect(() => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
      setIsSolving(false);
    }
    resetProgress();
  }, [grid, selected, resetProgress]);

  // Sync progress state every 150ms while animating
  useEffect(() => {
    if (!isSolving) return;
    const id = setInterval(() => setProgress(progressRef.current), 150);
    return () => clearInterval(id);
  }, [isSolving]);

  const handleReset = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    setIsSolving(false);
    resetProgress();
    if (mazeRef.current) drawMaze(mazeRef.current.getContext("2d"), grid, startNode, targetNode);
  };

  const handleToggleSolve = () => {
    if (isSolving) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
      setIsSolving(false);
    } else {
      // Finished → restart from scratch
      if (stepsRef.current.length > 0 && progressRef.current >= stepsRef.current.length) {
        progressRef.current = 0;
        setProgress(0);
      }

      const timerId = solveAndAnimate(
        selected, grid, mazeRef.current, startNode, targetNode,
        progressRef, stepsRef, speed,
        (s) => setStats(s),
        () => { setIsSolving(false); setProgress(progressRef.current); }
      );
      animationTimerRef.current = timerId;
      setIsSolving(true);
    }
  };

  const hasStarted = progress > 0 || stepsRef.current.length > 0;
  const isFinished = stepsRef.current.length > 0 && progress >= stepsRef.current.length;
  const isPaused   = !isSolving && progress > 0 && !isFinished;
  let solveLabel = isSolving ? "⏸ Pause" : isPaused ? "▶ Continue" : `▶ Run ${selected}`;


  // Progress percentage for the progress bar
  const pct = stepsRef.current.length > 0
    ? Math.min(100, Math.round((progress / stepsRef.current.length) * 100))
    : 0;

  return (
    <>
      {/* ── LEFT PANEL: controls ── */}
      <div className="panel_left">
        <div className="panel_title"> Tom & Jerry Chase</div>

        <div className="control_group">
          <label className="control_label">
            Grid Size <span className="control_value">{cellCount * 2 - 1}×{cellCount * 2 - 1}</span>
          </label>
          <input type="range" min="5" max="51" step="2"
            disabled={mapIndex !== 0}
            value={cellCount} onChange={(e) => setCellCount(Number(e.target.value))} />
        </div>

        <div className="control_group">
          <label className="control_label">
            Puddle Density <span className="control_value">{Math.round(density * 100)}%</span>
          </label>
          <input type="range" min="0.01" max="0.50" step="0.01"
            disabled={mapIndex !== 0}
            value={density} onChange={(e) => setDensity(Number(e.target.value))} />
        </div>

        <div className="control_group">
          <label className="control_label">
            Speed <span className="control_value">{speed}</span>
          </label>
          <input type="range" min="1" max="51" step="1"
            disabled={hasStarted}
            value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: "100%", fontSize: "17px", fontWeight:600 }}>
          <label>Choose A Map</label>
          <select style={{display: "flex", textAlign: "center", fontSize: 17, borderRadius: 10, padding: 5, fontWeight: 600, color:"white", backgroundColor: "grey"}}
          value={mapIndex} 
          onChange={(e) => setMapIndex(Number(e.target.value))}
          >
            {benchmarkMaps.map((m, idx) => (
              <option key={idx} value={idx}>{m.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: "100%", fontSize: "17px", fontWeight:600 }}>
          <label>Choose An Algorithm</label>
          <select style={{display: "flex", textAlign: "center", fontSize: 17, borderRadius: 10, padding: 5, fontWeight: 600, color:"white", backgroundColor: "grey"}}
          value={selected} 
          onChange={(e) => setSelected(e.target.value)}
          >
            <option>DFS</option>
            <option>BFS</option>
            <option>UCS</option>
            <option>A*</option>
            <option>Beam Search</option>
            <option>IDA*</option>
            <option>IDDFS</option>
            <option>Bidirectional</option>
          </select>
        </div>

        <div className="button_group">
          <button className="btn btn_secondary" onClick={() => setSeed(Date.now())}>
            New Maze
          </button>
          <button
            className={`btn ${isSolving ? "btn_pause" : "btn_primary"}`}
            onClick={handleToggleSolve}
          >
            {solveLabel}
          </button>
          <button className="btn btn_ghost" onClick={handleReset} disabled={!hasStarted}>
            ↺ Reset
          </button>
        </div>

        {/* Progress bar */}
        {hasStarted && (
          <div className="progress_wrap">
            <div className="progress_bar" style={{ width: `${pct}%` }} />
            <span className="progress_label">{pct}%</span>
          </div>
        )}
      </div>

      {/* ── CENTER: canvas ── */}
      <div className="center_content">
        <MazeGenerator ref={mazeRef} grid={grid} startNode={startNode} targetNode={targetNode} />
      </div>

      {/* ── RIGHT PANEL: legend + stats ── */}
      <div className="panel_right">
        <div className="panel_title">Legend</div>

        <div className="legend">
          <div className="legend_row"><span style={{fontSize:"1.1rem", display:"inline-block", width:"20px", textAlign:"center"}}>🧱</span>Wall</div>
          <div className="legend_row"><span className="swatch" style={{background:"#fcf9f2", border:"1px solid #ccc"}} />Open path (cost 1)</div>
          <div className="legend_row"><span style={{fontSize:"1.1rem", display:"inline-block", width:"20px", textAlign:"center"}}>💦</span>Puddle (cost 3)</div>
          <div className="legend_row"><span style={{fontSize:"1.1rem", display:"inline-block", width:"20px", textAlign:"center"}}>🐭</span>Jerry (Start)</div>
          <div className="legend_row"><span style={{fontSize:"1.1rem", display:"inline-block", width:"20px", textAlign:"center"}}>🧀</span>Cheese (End)</div>
          <div className="legend_row"><span className="swatch" style={{background:"rgba(99,179,237,0.65)"}} />Visited</div>
          <div className="legend_row"><span className="swatch" style={{background:"rgba(252,129,74,0.45)"}} />Backtracked</div>
        </div>

        {/* Stats — shown as soon as search finishes computing */}
        {stats && (
          <div className="stats_box">
            <div className="stats_title"> {selected} Results</div>
            <div className="stat_row">
              <span className="stat_label">Cells visited</span>
              <span className="stat_value">{stats.visitedCount}</span>
            </div>
            <div className="stat_row">
              <span className="stat_label">Path cost</span>
              <span className="stat_value">{stats.pathCost}</span>
            </div>
            <div className="stat_row">
              <span className="stat_label">Total steps</span>
              <span className="stat_value">{stepsRef.current.length}</span>
            </div>
            <div className="stat_row">
              <span className="stat_label">Execution time</span>
              <span className="stat_value">{stats.time.toFixed(3)} ms</span>
            </div>
            {isFinished && (
              <div className="stat_note">Search completed</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}