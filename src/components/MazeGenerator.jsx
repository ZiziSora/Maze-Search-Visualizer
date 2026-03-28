import { useRef, useEffect } from "react";
import React from "react";
import { useImperativeHandle, forwardRef } from 'react';

import { DFS } from "./SearchAlgorithm/DFSNEW";
import { IDAStar } from "./SearchAlgorithm/IDAstar";

// ─── Maze Generation ─────────────────────────────────────────────────────────

export function generateMaze(numCells, costDensity = 0.18, seed = 42) {
  const size = 2 * numCells + 1;

  let s = seed >>> 0;
  const rand = () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
  const randInt = (n) => Math.floor(rand() * n);

  const grid = Array.from({ length: size }, () => new Array(size).fill(1));
  const visit = Array.from({ length: numCells }, () => new Array(numCells).fill(false));

  const stack = [];
  const startR = randInt(numCells);
  const startC = randInt(numCells);
  visit[startR][startC] = true;
  stack.push([startR, startC]);
  grid[2 * startR + 1][2 * startC + 1] = 0;

  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];
    const shuffled = [...DIRS].sort(() => rand() - 0.5);
    let moved = false;

    for (const [dr, dc] of shuffled) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr < 0 || nr >= numCells || nc < 0 || nc >= numCells) continue;
      if (visit[nr][nc]) continue;

      grid[2 * cr + 1 + dr][2 * cc + 1 + dc] = 0;
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

export const CELL_COLORS = {
  1: "#1a1a2e",  // wall  – deep navy
  0: "#f5f0eb",  // path  – warm off-white
  3: "#2dd4bf",  // muddy – teal
};

// Visit / backtrack / path colors for the animation overlay
export const STEP_COLORS = {
  visit:     "rgba(99, 179, 237, 0.65)",  // soft blue
  backtrack: "rgba(252, 129, 74, 0.45)",  // soft orange
  target:    "rgba(72, 199, 142, 0.9)",   // bright green
};

const CANVAS_PX = 600;

export function drawMaze(ctx, grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const cellPx = CANVAS_PX / rows;

  ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = CELL_COLORS[grid[r][c]] ?? "#ffffff";
      ctx.fillRect(
        Math.round(c * cellPx),
        Math.round(r * cellPx),
        Math.ceil(cellPx),
        Math.ceil(cellPx)
      );
    }
  }

  // Draw start marker (top-left open cell)
  drawMarker(ctx, 1, 1, cellPx, "#22c55e", "S");
  // Draw end marker (bottom-right open cell)
  const end = rows - 2;
  drawMarker(ctx, end, end, cellPx, "#ef4444", "E");
}

function drawMarker(ctx, r, c, cellPx, color, label) {
  const x = Math.round(c * cellPx);
  const y = Math.round(r * cellPx);
  const size = Math.ceil(cellPx);

  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);

  // Only draw label if cells are big enough to be readable
  if (cellPx >= 10) {
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.max(8, Math.floor(cellPx * 0.65))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + size / 2, y + size / 2);
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const MazeGenerator = forwardRef(({ grid }, ref) => {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawMaze(canvas.getContext("2d"), grid);
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
        borderRadius: "8px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
      }}
    />
  );
});

export default MazeGenerator;

// ─── Solve + Animate ─────────────────────────────────────────────────────────

// speed: 1 (slowest) → 51 (fastest). Converted to ms delay: higher speed = shorter interval.
export function solveAndAnimate(algoName, grid, canvas, progressRef, stepsRef, speed, onStats, onComplete) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rows = grid.length;
  const cellSize = CANVAS_PX / rows;

  if (progressRef.current === 0) {
    drawMaze(ctx, grid);

    if (algoName === 'DFS') {
      console.log("Running DFS");
      const result = DFS(grid, [1, 1], [rows - 2, rows - 2]);
      stepsRef.current = result.history;
      if (onStats) onStats({ visitedCount: result.exploredNodes.length, pathCost: result.cost, time: result.time });
    } else if (algoName === "IDA*") {
      console.log("Running IDA*");
      const result = IDAStar(grid, [1, 1], [rows - 2, rows - 2]);
      stepsRef.current = result.history;
      if (onStats) onStats({ visitedCount: result.exploredNodes.length, pathCost: result.cost, time: result.time });
    }
  }

  const steps = stepsRef.current;
  // Invert speed so slider feels natural: higher value = faster = shorter delay
  const delayMs = Math.max(1, Math.round(1050 - speed * 20));

  const interval = setInterval(() => {
    if (progressRef.current >= steps.length) {
      clearInterval(interval);
      if (onComplete) onComplete();
      return;
    }

    const { r, c, type } = steps[progressRef.current];
    ctx.fillStyle = STEP_COLORS[type] ?? STEP_COLORS.visit;
    ctx.fillRect(
      Math.round(c * cellSize),
      Math.round(r * cellSize),
      Math.ceil(cellSize),
      Math.ceil(cellSize)
    );

    progressRef.current++;
  }, delayMs);

  return interval;
}