import { useRef, useEffect } from "react";
import React from "react";
import { useImperativeHandle, forwardRef } from 'react';

import { DFS } from "../algorithms/DFS.js";
import { BFS } from "../algorithms/BFS.js";
import { uniformCostSearchGrid } from "../algorithms/UCS.js";
import { aStarSearch } from "../algorithms/AStar.js";
import { beamSearch } from "../algorithms/BeamSearch.js";
import { IDAStar } from "../algorithms/IDAStar.js";
import { IDDFS } from "../algorithms/IDDFS.js";
import { bidirectionalSearchGrid } from "../algorithms/bidirectional.js";

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




function drawEmoji(ctx, r, c, cellPx, emoji, bgColor = null) {
  const x = Math.round(c * cellPx);
  const y = Math.round(r * cellPx);
  const size = Math.ceil(cellPx);

  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, size, size);
  }

  if (cellPx >= 8) {
    ctx.font = `${Math.floor(cellPx * 0.75)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 👉 THÊM Ở ĐÂY
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeText(emoji, x + size / 2, y + size / 2 + (cellPx * 0.05));

    ctx.fillText(emoji, x + size / 2, y + size / 2 + (cellPx * 0.05));
  }
}

export function drawMaze(ctx, grid, startNode, targetNode) {
  const rows = grid.length;
  const cols = grid[0].length;
  const cellPx = CANVAS_PX / rows;

  ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = grid[r][c];

      // Base path background
      ctx.fillStyle = "#fcf9f2";
      ctx.fillRect(
        Math.round(c * cellPx),
        Math.round(r * cellPx),
        Math.ceil(cellPx),
        Math.ceil(cellPx)
      );

      if (type === 1) {
        // Wall
        drawEmoji(ctx, r, c, cellPx, "🧱", "#e2e8f0");
      } else if (type === 3) {
        // Swamp / Hazard
        drawEmoji(ctx, r, c, cellPx, "🪨", "#bae6fd");
      }
    }
  }

  // Draw start marker (Jerry) - Migrated to CSS Overlay Div, no longer drew on Canvas directly
  // Draw end marker (Cheese)
  if (targetNode) drawEmoji(ctx, targetNode[0], targetNode[1], cellPx, "🧀", "#fde68a(239, 68, 68, 0.2)")
  //drawEmoji(ctx, r, c, cellSize, "🧀", "");
}

// ─── Component ───────────────────────────────────────────────────────────────

const MazeGenerator = forwardRef(({ grid, startNode, targetNode }, ref) => {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawMaze(canvas.getContext("2d"), grid, startNode, targetNode);

    // Reset Jerry Sprite visually
    const rows = grid.length || 1;
    const cellSize = CANVAS_PX / rows;
    const jr = startNode ? startNode[0] : 1;
    const jc = startNode ? startNode[1] : 1;
    const jerryContainer = document.getElementById("jerry-sprite-container");
    const jerryInner = document.getElementById("jerry-sprite");
    if (jerryContainer) {
      jerryContainer.style.transform = `translate(${Math.round(jc * cellSize)}px, ${Math.round(jr * cellSize)}px)`;
    }
    if (jerryInner) {
      jerryInner.innerHTML = "🐭";
    }
  }, [grid, startNode, targetNode]);

  const rows = grid.length || 1;
  const cellSize = CANVAS_PX / rows;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: CANVAS_PX, margin: "0 auto" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_PX}
        height={CANVAS_PX}
        style={{
          display: "block",
          width: "100%",
          imageRendering: "pixelated",
          borderRadius: "8px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        }}
      />
      <div
        id="jerry-sprite-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          zIndex: 100,
          pointerEvents: "none",
          transition: "transform 0.1s linear"
        }}
      >
        <div
          id="jerry-sprite"
          className="jerry-sprite"
          style={{
            width: "100%",
            height: "100%",
            fontSize: `${Math.floor(cellSize * 0.75)}px`,
          }}
        >
          🐭
        </div>
      </div>
    </div>
  );
});

export default MazeGenerator;

// ─── Solve + Animate ─────────────────────────────────────────────────────────

// speed: 1 (slowest) → 51 (fastest). Converted to ms delay: higher speed = shorter interval.
export function solveAndAnimate(
  algoName,
  grid,
  canvas,
  startNode,
  targetNode,
  progressRef,
  stepsRef,
  speed,
  onStats,
  onComplete
) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const rows = grid.length;
  const cellSize = CANVAS_PX / rows;

  let result = null;

  let visitedCount = 0;   
  let currentCost = 0;
  let currentLength = 0;
  let noPathFlag = false;

  if (progressRef.current > 0 && stepsRef.current) {
    result = stepsRef.current.algoResult || null;
    if (result && (!result.path || result.path.length === 0)) {
      noPathFlag = true;
    }

    const steps = stepsRef.current;
    for (let i = 0; i < progressRef.current; i++) {
      if (!steps[i]) continue;
      const { r, c, type } = steps[i];
      if (type === 'visit' || type === 'backtrack') {
        visitedCount++;
      } else if (type === 'target') {
        currentLength++;
        if (currentLength > 1) {
          const cellVal = grid[r][c];
          const cellCost = cellVal === 3 ? 3 : 1;
          currentCost += cellCost;
        }
      }
    }
  }

  if (progressRef.current === 0) {
    drawMaze(ctx, grid, startNode, targetNode);

    // Reset Jerry Sprite visually right before starting animation
    const jerryContainer = document.getElementById("jerry-sprite-container");
    const jerryInner = document.getElementById("jerry-sprite");
    if (jerryContainer && startNode) {
      jerryContainer.style.transitionDuration = "0ms";
      jerryContainer.style.transform = `translate(${Math.round(startNode[1] * cellSize)}px, ${Math.round(startNode[0] * cellSize)}px)`;
      // force reflow
      void jerryContainer.offsetWidth; 
    }
    if (jerryInner) {
      jerryInner.innerHTML = "🐭";
    }

    if (algoName === 'DFS') result = DFS(grid, startNode, targetNode);
    else if (algoName === 'BFS') result = BFS(grid, startNode, targetNode);
    else if (algoName === 'UCS') result = uniformCostSearchGrid(grid, startNode, targetNode);
    else if (algoName === 'A*') result = aStarSearch(grid, startNode, targetNode);
    else if (algoName === 'Beam Search') result = beamSearch(grid, startNode, targetNode);
    else if (algoName === 'IDA*') result = IDAStar(grid, startNode, targetNode);
    else if (algoName === 'IDDFS') result = IDDFS(grid, startNode, targetNode);
    else if (algoName === 'Bidirectional') result = bidirectionalSearchGrid(grid, startNode, targetNode);

    if (result) {

  // ❌ NO PATH
  if (!result.path || result.path.length === 0) {
    noPathFlag = true;

    stepsRef.current = result.exploredNodes.map(node => ({
      r: node[0],
      c: node[1],
      type: 'visit'
    }));
  }

  // ✅ CÓ PATH
  else {
    let finalSteps = result.history;

    if (!finalSteps) {
      finalSteps = [];

      if (result.exploredNodes) {
        finalSteps.push(
          ...result.exploredNodes.map(node => ({
            r: node[0],
            c: node[1],
            type: 'visit'
          }))
        );
      }

      if (result.path) {
        finalSteps.push(
          ...result.path.map(node => ({
            r: node[0],
            c: node[1],
            type: 'target'
          }))
        );
      }
    }

    stepsRef.current = finalSteps;
  }
  
  // Attach result so we can recover it on pause/continue
  if (stepsRef.current) {
    stepsRef.current.algoResult = result;
  }
}
  }

  const steps = stepsRef.current;

  const delayMs = Math.max(1, Math.round(1050 - speed * 20));
  const framesToSkip = Math.max(0, Math.round(180 / delayMs) - 1);
  let skipCount = 0;

  const interval = setInterval(() => {
    if (progressRef.current >= steps.length) {
      clearInterval(interval);

      // 👉 FINAL stats (chuẩn 100%)
      if (onStats && result) {
        onStats({
          exploredCount: result.exploredCount ?? progressRef.current,
          pathCost: result.pathCost ?? currentCost,
          pathLength: result.pathLength ?? currentLength,
          time: result.time ?? 0,
          noPath: noPathFlag
        });
      }

      if (onComplete) onComplete();
      return;
    }
    const { r, c, type } = steps[progressRef.current];

    if (type === 'target' && skipCount < framesToSkip) {
      skipCount++;
      return;
    }
    skipCount = 0;

    // 👉 VẼ
    if (type === 'visit' || type === 'backtrack') {
      visitedCount++;
      ctx.fillStyle = STEP_COLORS[type] ?? STEP_COLORS.visit;
      ctx.fillRect(
        Math.round(c * cellSize),
        Math.round(r * cellSize),
        Math.ceil(cellSize),
        Math.ceil(cellSize)
      );
    }

    else if (type === 'target') {
      
      ctx.fillStyle = STEP_COLORS.target;
      ctx.fillRect(
        Math.round(c * cellSize),
        Math.round(r * cellSize),
        Math.ceil(cellSize),
        Math.ceil(cellSize)
      );

      // 👉 update path stats
      currentLength++;
      if (currentLength > 1) {
        const cellVal = grid[r][c];
        const cellCost = cellVal === 3 ? 3 : 1;
        currentCost += cellCost;
      }

      // Jerry move
      const isEnd = progressRef.current === steps.length - 1;
      const jerryContainer = document.getElementById("jerry-sprite-container");
      const jerryInner = document.getElementById("jerry-sprite");

      if (jerryContainer) {
        jerryContainer.style.transitionDuration =
          `${Math.max(delayMs * (framesToSkip + 1), 100)}ms`;

        jerryContainer.style.transform =
          `translate(${Math.round(c * cellSize)}px, ${Math.round(r * cellSize)}px)`;
      }

      if (isEnd && jerryInner) {
        jerryInner.innerHTML = "😋";
      }
    }

    progressRef.current++;

    // 👉 UPDATE STATS REAL-TIME
    if (onStats) {
      onStats({
        exploredCount: visitedCount,
        pathCost: currentCost,
        pathLength: currentLength,
        time: result?.time ?? 0,
        noPath: false
      });
    }

  }, delayMs);

  return interval;
}