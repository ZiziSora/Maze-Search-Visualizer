// DFS
const DFS = (maze, start, goal) => {
  const path = [];
  const exploredNodes = [];
  const visited = new Set();
  let cost = 0;
  const timeStart = performance.now();
  const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];


  function isValid(x, y) {
    return x >= 0 && y >= 0 && x < maze.length && y < maze[0].length && maze[x][y] !== 1;
  }

  function dfsRecurse(x, y, currentPath, currentCost) {
    if (!isValid(x, y)) return false;
    const key = `${x},${y}`;
    if (visited.has(key)) return false;

    visited.add(key);
    exploredNodes.push([x, y]);
    currentPath.push([x, y]);
    const moveCost = maze[x][y] === 3 ? 3 : 1;
    currentCost[0] += moveCost;

    if (x === goal[0] && y === goal[1]) {
      cost = currentCost[0];
      path.push(...currentPath);
      return true;
    }

    for (const [dx, dy] of DIRECTIONS) {
      if (dfsRecurse(x + dx, y + dy, currentPath, currentCost)) return true;
    }

    currentPath.pop();
    currentCost[0] -= moveCost;
    // Do NOT delete from visited here to maintain O(V) graph traversal instead of O(b^d) exponential simple path traversal
    return false;
  }

  dfsRecurse(start[0], start[1], [], [0]);

  return {
    path,
    exploredCount: exploredNodes.length,
    pathCost: cost,
    exploredNodes,
    time: performance.now() - timeStart,
  };
};

export {DFS}; 