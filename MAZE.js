const grid = [
  [0, 3, 1, 0, 0],
  [0, 0, 1, 3, 0],
  [1, 0, 0, 0, 1],
  [1, 3, 1, 0, 0],
  [1, 0, 0, 3, 0],
];

const ROWS = grid.length;
const COLS = grid[0].length;

const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function heuristic(x, y, endx, endy) {
  return Math.abs(x - endx) + Math.abs(y - endy);
}

function isValid(x, y) {
  return x >= 0 && y >= 0 && x < ROWS && y < COLS && grid[x][y] !== 1;
}

function printPath(path, costObj) {
  if (!path || path.length === 0) {
    console.log("  No path found.");
    return;
  }
  console.log("  Path (" + path.length + " steps): cost " + costObj.value);
  console.log("  " + path.map(([x, y]) => `(${x},${y})`).join(" → "));
}

// DFS
function DFSAlgorithm(startx, starty, endx, endy, costObj) {
  const visited = new Set();

  function dfsRecurse(x, y, path) {
    if (!isValid(x, y)) return null;
    const key = `${x},${y}`;
    if (visited.has(key)) return null;

    visited.add(key);
    path.push([x, y]);
    costObj.value += (grid[x][y] === 3 ? 3 : 1);

    if (x === endx && y === endy) return path;

    for (const [dx, dy] of DIRECTIONS) {
      const result = dfsRecurse(x + dx, y + dy, path);
      if (result) return result;
    }

    // Fix #1: subtract the cost of the cell being removed
    const popped = path.pop();
    costObj.value -= (grid[popped[0]][popped[1]] === 3 ? 3 : 1);
    visited.delete(key);
    return null;
  }

  return dfsRecurse(startx, starty, []);
}

// IDA*
function IDAStar(startx, starty, endx, endy, costObj) {
  costObj.value += (grid[startx][starty] === 3 ? 3 : 1);

  function search(x, y, g, threshold, path, visited) {
    const f = g + heuristic(x, y, endx, endy);
    if (f > threshold) return f;
    if (x === endx && y === endy) return "FOUND";

    let min = Infinity;

    for (const [dx, dy] of DIRECTIONS) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;

      if (isValid(nx, ny) && !visited.has(key)) {
        const moveCost = grid[nx][ny] === 3 ? 3 : 1;

        visited.add(key);
        path.push([nx, ny]);
        costObj.value += moveCost;

        const result = search(nx, ny, g + moveCost, threshold, path, visited);

        if (result === "FOUND") return "FOUND";
        if (result < min) min = result;

        path.pop();
        costObj.value -= moveCost;
        visited.delete(key);
      }
    }

    return min;
  }

  let threshold = heuristic(startx, starty, endx, endy);
  let iteration = 0;

  while (true) {
    iteration++;
    const path    = [[startx, starty]];
    const visited = new Set([`${startx},${starty}`]);
    const result  = search(startx, starty, 0, threshold, path, visited);

    if (result === "FOUND") return path;
    if (result === Infinity) return null;
    threshold = result;
  }
}

// RUN
function solve(algorithm, startx, starty, endx, endy) {
  console.log(`\nRunning ${algorithm.toUpperCase()} from (${startx},${starty}) to (${endx},${endy})`);
  console.log("─".repeat(45));

  let path, costObj = {value: 0};
  if (algorithm === "dfs") {
    path = DFSAlgorithm(startx, starty, endx, endy, costObj);
  } else if (algorithm === "idaStar") {
    path = IDAStar(startx, starty, endx, endy, costObj);
  } else {
    console.log("Unknown algorithm. Choose 'dfs' or 'idaStar'.");
    return;
  }

  printPath(path, costObj);
}

solve("dfs", 0, 0, 3, 3);
solve("idaStar", 0, 0, 3, 3);