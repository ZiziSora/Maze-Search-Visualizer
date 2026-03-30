class Cell {
  constructor() {
    this.parent_i = 0;
    this.parent_j = 0;
    this.f = Infinity;
    this.g = Infinity;
    this.h = 0;
  }
}

// ================= COMMON =================

// kiểm tra hợp lệ
function isValid(grid, row, col) {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

// ô đi được (cost > 0)
function isValidCell(grid, row, col) {
  return grid[row][col] != 1;
}

// kiểm tra đích
function isDestination(row, col, dest) {
  return row === dest[0] && col === dest[1];
}

// heuristic (Euclid)
function calculateH(row, col, dest) {
  return Math.hypot(row - dest[0], col - dest[1]);
}

// in path
function printPath(path) {
  console.log(path.map(p => `[${p[0]}, ${p[1]}]`).join(" -> "));
}

function tracePath(cellDetails, dest) {
  let path = [];
  let [row, col] = dest;

  while (!(cellDetails[row][col].parent_i === row && cellDetails[row][col].parent_j === col)) {
    path.push([row, col]);
    [row, col] = [cellDetails[row][col].parent_i, cellDetails[row][col].parent_j];
  }
  path.push([row, col]);
  path.reverse();
  return path;
}

// ================= A* =================

export function aStarSearch(grid, src, dest) {
  const closed = [];
  const exploredNodes = [];
  let timeStart = performance.now();
  for (let x = 0; x < grid.length; x++) {
    closed[x] = [];
    for (let y = 0; y < grid[0].length; y++) {
      closed[x][y] = false;
    }
  }

  const cell = [];
  for (let x = 0; x < grid.length; x++) {
    cell[x] = [];
    for (let y = 0; y < grid[0].length; y++) {
      cell[x][y] = new Cell();
    }
  }

  let [i, j] = src;

  cell[i][j] = { f: 0, g: 0, h: 0, parent_i: i, parent_j: j };

  let open = [{ f: 0, i, j }];

  let dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
  ];

  while (open.length) {
    open.sort(function (a, b) {
      return a.f - b.f;
    });

    ({ i, j } = open.shift());
    if (closed[i][j]) continue;
    closed[i][j] = true;
    exploredNodes.push([i, j]);

    if (isDestination(i, j, dest)) {
      let path = tracePath(cell, dest);
      let finalCost = cell[i][j].g;

      // FORMAT RETURN CHUẨN MỚI
      return {
        path: path,
        pathLength: path.length,
        exploredNodes: exploredNodes,
        exploredCount: exploredNodes.length,
        pathCost: finalCost,
        time: performance.now() - timeStart,
        noPath: false
      };
    }

    for (let [di, dj] of dirs) {
      let ni = i + di,
        nj = j + dj;

      if (!isValid(grid, ni, nj) || !isValidCell(grid, ni, nj) || closed[ni][nj]) continue;

      let cost;
      cost = grid[ni][nj] === 3 ? 3 : 1;
      let gNew = cell[i][j].g + cost;
      let hNew = calculateH(ni, nj, dest);
      let fNew = gNew + hNew;

      if (cell[ni][nj].f > fNew) {
        cell[ni][nj] = {
          f: fNew,
          g: gNew,
          h: hNew,
          parent_i: i,
          parent_j: j
        };
        open.push({ f: fNew, i: ni, j: nj });
      }
    }
  }

  // TRẢ VỀ KHI KHÔNG TÌM THẤY ĐƯỜNG
  return {
    path: [],
    pathLength: 0,
    exploredNodes: exploredNodes,
    exploredCount: exploredNodes.length,
    pathCost: 0,
    time: performance.now() - timeStart,
    noPath: true
  };
}

// ================= BEAM SEARCH =================
