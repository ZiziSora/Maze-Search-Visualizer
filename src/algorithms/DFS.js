const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1]
];

// DFS
export const DFS = (maze, start, goal) => {
  const path = [];
  const exploredNodes = [];
  const visited = new Set();
  let cost = 0;
  const timeStart = performance.now();

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
    if (!(x === start[0] && y === start[1])) {
      currentCost[0] += moveCost;
    }

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
    return false;
  }

  dfsRecurse(start[0], start[1], [], [0]);
  if (path.length === 0) {
    return {
      path: [],
      pathLength: 0,
      exploredCount: exploredNodes.length,
      pathCost: 0,
      exploredNodes: exploredNodes,
      time: performance.now() - timeStart,
      noPath: true
    };
  }

  return {
    path: path,
    pathLength: path.length,
    exploredCount: exploredNodes.length,
    exploredNodes: exploredNodes,
    pathCost: cost,
    time: performance.now() - timeStart,
    noPath: false
  };
};
