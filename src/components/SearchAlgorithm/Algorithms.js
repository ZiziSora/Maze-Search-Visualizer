// components/Algorithms.js

export const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

export function isValid(x, y, grid) {
  // Check bounds and make sure it's not a wall (1)
  return x >= 0 && y >= 0 && x < grid.length && y < grid[0].length && grid[x][y] !== 1;
}

export function DFSWithHistory(startX, startY, endX, endY, grid) {
  const history = [];
  const visited = new Set();

  function dfsRecurse(x, y) {
    if (!isValid(x, y, grid)) return false;
    
    const key = `${x},${y}`;
    if (visited.has(key)) return false;

    // --- 1. RECORD THE VISIT ---
    visited.add(key);
    history.push({ r: x, c: y, type: 'visit' });

    // --- 2. CHECK IF WE WON ---
    if (x === endX && y === endY) {
      history.push({ r: x, c: y, type: 'target' }); // Mark the end!
      return true;
    }

    // --- 3. EXPLORE NEIGHBORS ---
    for (const [dx, dy] of DIRECTIONS) {
      if (dfsRecurse(x + dx, y + dy)) return true;
    }

    // --- 4. RECORD THE BACKTRACK (Dead End) ---
    history.push({ r: x, c: y, type: 'backtrack' });
    return false;
  }

  dfsRecurse(startX, startY);
  return history;
}