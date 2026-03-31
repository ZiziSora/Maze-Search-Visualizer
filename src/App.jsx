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
  const [speed,     setSpeed]     = useState(26);   
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

  useEffect(() => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
      setIsSolving(false);
    }
    resetProgress();
    handleReset();
    
  }, [grid, selected, resetProgress]);

  const isIddfsAllowed = true; 
  const isIdaStarAllowed = (mapIndex === 0 || mapIndex === 1 || mapIndex === 3) && grid.length <= 31;

  useEffect(() => {
    if (selected === 'IDDFS' && !isIddfsAllowed) setSelected('DFS');
    if (selected === 'IDA*' && !isIdaStarAllowed) setSelected('DFS');
  }, [grid.length, mapIndex, selected]);

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
    
    const jerryContainer = document.getElementById("jerry-sprite-container");
    const jerryInner = document.getElementById("jerry-sprite");
    if (jerryContainer && startNode) {
      const cellSize = 600 / grid.length;
      jerryContainer.style.transitionDuration = "0s";
      jerryContainer.style.transform = `translate(${Math.round(startNode[1] * cellSize)}px, ${Math.round(startNode[0] * cellSize)}px)`;
      setTimeout(() => jerryContainer.style.transitionDuration = "0.1s", 50);
    }
    if (jerryInner) jerryInner.innerHTML = "🐭";
  };

  const handleToggleSolve = () => {
    if (isSolving) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
      setIsSolving(false);
    } else {
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
            Grid Size <span className="control_value">{grid.length}×{grid[0].length}</span>
          </label>
          <input type="range" min="5" max="50" step="2"
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
          <input type="range" min="1" max="50" step="1"
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
            {isIdaStarAllowed && <option>IDA*</option>}
            {isIddfsAllowed && <option>IDDFS</option>}
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
          <div className="legend_row"><span style={{fontSize:"1.1rem", display:"inline-block", width:"20px", textAlign:"center"}}>🪨</span>Rock (cost 3)</div>
          <div className="legend_row"><span style={{fontSize:"1.1rem", display:"inline-block", width:"20px", textAlign:"center"}}>🐭</span>Jerry (Start)</div>
          <div className="legend_row"><span style={{fontSize:"1.1rem", display:"inline-block", width:"20px", textAlign:"center"}}>🧀</span>Cheese (End)</div>
          <div className="legend_row"><span className="swatch" style={{background:"rgba(99,179,237,0.65)"}} />Visited</div>
          <div className="legend_row"><span className="swatch" style={{background:"rgba(252,129,74,0.45)"}} />Backtracked</div>
        </div>

        {/* Stats — shown as soon as search finishes computing */}
        {stats && (
          <div className="stats_box">
            {stats.noPath && (
              <div style={{ color: "#ef4444", fontWeight: "bold", marginBottom: "8px" }}>
                No path found
              </div>
            )}
            <div className="stats_title"> {selected} Results</div>
            <div className="stat_row">
              <span className="stat_label">Cells visited</span>
              <span className="stat_value">{stats.exploredCount}</span>
            </div>
            <div className="stat_row">
              <span className="stat_label">Path cost</span>
              <span className="stat_value">{stats.pathCost}</span>
            </div>
            <div className="stat_row">
              <span className="stat_label">Path length</span>
              <span className="stat_value">{stats.pathLength}</span>
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