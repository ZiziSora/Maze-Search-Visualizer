import { useRef, useEffect, useMemo } from "react";
import React from "react";
import { DFSWithHistory } from "./SearchAlgorithm/Algorithms";
import { useImperativeHandle, forwardRef } from 'react';


// ─── Maze Generation ────────────────────────────────────────────────────────
export function generateMaze(numCells, costDensity = 0.18, seed = 42) {
  const size = 2 * numCells + 1;

  // Seeded PRNG (mulberry32) so results are deterministic per seed
  let s = seed >>> 0;
  const rand = () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
  const randInt = (n) => Math.floor(rand() * n);

  // Fill everything with walls
  const grid = Array.from({ length: size }, () => new Array(size).fill(1));

  // Carve out logical cell positions (odd row, odd col)
  const visit = Array.from({ length: numCells }, () =>
    new Array(numCells).fill(false)
  );

  // DFS stack-based backtracker
  const stack = [];
  const startR = randInt(numCells);
  const startC = randInt(numCells);
  visit[startR][startC] = true;
  stack.push([startR, startC]);

  // Mark start cell as open
  grid[2 * startR + 1][2 * startC + 1] = 0;

  const DIRS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];

    // Shuffle neighbours
    const shuffled = [...DIRS].sort(() => rand() - 0.5);
    let moved = false;

    for (const [dr, dc] of shuffled) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr < 0 || nr >= numCells || nc < 0 || nc >= numCells) continue;
      if (visit[nr][nc]) continue;

      // Carve: open the wall between (cr,cc) and (nr,nc)
      const wallR = 2 * cr + 1 + dr;
      const wallC = 2 * cc + 1 + dc;
      grid[wallR][wallC] = 0;

      // Open the new cell
      grid[2 * nr + 1][2 * nc + 1] = 0;

      visit[nr][nc] = true;
      stack.push([nr, nc]);
      moved = true;
      break;
    }

    if (!moved) stack.pop();
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0 && rand() < costDensity) {
        grid[r][c] = 3;
      }
    }
  }

  return grid;
}

// ─── Canvas Renderer ─────────────────────────────────────────────────────────

const CELL_COLORS = {
  1: "#1a1a2e", // wall  – deep navy
  0: "#f0ede8", // path  – warm off-white
  3: "#38b2ac", // muddy – teal
};

const CANVAS_PX = 600;

export function drawMaze(ctx, grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const cellPx = CANVAS_PX / rows;

  ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r][c];
      ctx.fillStyle = CELL_COLORS[val] ?? "#ffffff";
      ctx.fillRect(
        Math.round(c * cellPx),
        Math.round(r * cellPx),
        Math.ceil(cellPx),
        Math.ceil(cellPx)
      );
    }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
const MazeGenerator = forwardRef(({ grid }, ref) => {
  const canvasRef = useRef(null);

  // This gives the parent access to the actual canvas DOM element
  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawMaze(ctx, grid); // Draws the initial walls/paths
  }, [grid]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_PX}
      height={CANVAS_PX}
      style={{
        display: "block",
        width: "100%",
        maxWidth: CANVAS_PX,
        imageRendering: "pixelated",
      }}
    />
  );
});

export default MazeGenerator;

// ─── Animation ───────────────────────────────────────────────────────────────
export function solveAndAnimate(algoName, grid, canvas, progressRef, stepsRef, speed, onComplete) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rows = grid.length;
  const cellSize = CANVAS_PX / rows;

  // 1. If starting fresh, get history and clear the canvas
  if (progressRef.current === 0) {
    drawMaze(ctx, grid); 
    
    if (algoName === 'DFS') {
      stepsRef.current = DFSWithHistory(1, 1, rows - 2, rows - 2, grid);
    }
  }

  let steps = stepsRef.current;

  // 2. Animate the steps using progressRef.current instead of i
  const interval = setInterval(() => {
    if (progressRef.current >= steps.length) {
      clearInterval(interval);
      if (onComplete) onComplete();
      return;
    }

    const { r, c, type } = steps[progressRef.current];
    
    // Pick color based on step type
    ctx.fillStyle = type === 'visit' ? "rgba(0, 191, 255, 0.6)" : "rgba(255, 100, 100, 0.4)";
    
    // Draw on top of the existing maze
    ctx.fillRect(
      Math.round(c * cellSize),
      Math.round(r * cellSize),
      Math.ceil(cellSize),
      Math.ceil(cellSize)
    );
    
    progressRef.current++; // Increment the global memory index
  }, speed); // Uses the speed slider value from App.jsx

  return interval;
}