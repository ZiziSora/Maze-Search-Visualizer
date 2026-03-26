const grid = [
  [0, 3, 1, 0, 0],
  [0, 0, 1, 3, 0],
  [1, 0, 0, 0, 1],
  [1, 3, 1, 0, 0],
  [1, 0, 0, 3, 0],
];

const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

// DFS
const DFS = (maze, start, goal) => {
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
    visited.delete(key);
    return false;
  }

  dfsRecurse(start[0], start[1], [], [0]);

  return {
    path,
    exploredNodes,
    cost,
    time: performance.now() - timeStart,
  };
};

// IDA*
const IDAStar = (maze, start, goal) => {
  const exploredNodes = [];
  let cost = 0;
  const timeStart = performance.now();

  function isValid(x, y) {
    return x >= 0 && y >= 0 && x < maze.length && y < maze[0].length && maze[x][y] !== 1;
  }

  function heuristic(x, y) {
    return Math.abs(x - goal[0]) + Math.abs(y - goal[1]);
  }

  function search(x, y, g, threshold, path, visited) {
    exploredNodes.push([x, y]);
    const f = g + heuristic(x, y);
    if (f > threshold) return f;
    if (x === goal[0] && y === goal[1]) return "FOUND";

    let min = Infinity;

    for (const [dx, dy] of DIRECTIONS) {
      const nx = x + dx, ny = y + dy;
      const key = `${nx},${ny}`;

      if (isValid(nx, ny) && !visited.has(key)) {
        const moveCost = maze[nx][ny] === 3 ? 3 : 1;
        visited.add(key);
        path.push([nx, ny]);

        const result = search(nx, ny, g + moveCost, threshold, path, visited);
        if (result === "FOUND") return "FOUND";
        if (result < min) min = result;

        path.pop();
        visited.delete(key);
      }
    }

    return min;
  }

  let threshold = heuristic(start[0], start[1]);
  let foundPath = null;

  while (true) {
    const path = [start];
    const visited = new Set([`${start[0]},${start[1]}`]);
    const result = search(start[0], start[1], 0, threshold, path, visited);

    if (result === "FOUND") {
      foundPath = path;
      cost = foundPath.reduce((sum, [x, y]) => sum + (maze[x][y] === 3 ? 3 : 1), 0) - 1;
      break;
    }
    if (result === Infinity) break;
    threshold = result;
  }

  return {
    path: foundPath ?? [],
    exploredNodes,
    cost,
    time: performance.now() - timeStart,
  };
};

console.log(DFS(grid, [0, 0], [3, 3]));
console.log(IDAStar(grid, [0, 0], [3, 3]));