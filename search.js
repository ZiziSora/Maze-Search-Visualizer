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

function printCost(cost) {}

// ================= A* =================

function tracePath(cellDetails, dest) {
  let path = [];
  let [row, col] = dest;

  while (!(cellDetails[row][col].parent_i === row && cellDetails[row][col].parent_j === col)) {
    path.push([row, col]);
    [row, col] = [cellDetails[row][col].parent_i, cellDetails[row][col].parent_j];
  }
  path.push([row, col]);
  path.reverse();
  console.log("Path:");
  printPath(path);
  console.log("Cost:", cellDetails[dest[0]][dest[1]].g);
}

function aStarSearch(grid, src, dest) {
  var closed = [];
  for (var x = 0; x < grid.length; x++) {
    closed[x] = [];
    for (var y = 0; y < grid[0].length; y++) {
      closed[x][y] = false;
    }
  }

  var cell = [];
  for (var x = 0; x < grid.length; x++) {
    cell[x] = [];
    for (var y = 0; y < grid[0].length; y++) {
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

    closed[i][j] = true;

    for (let [di, dj] of dirs) {
      let ni = i + di,
        nj = j + dj;

      if (!isValid(grid, ni, nj) || !isValidCell(grid, ni, nj) || closed[ni][nj]) continue;

      let cost;
      cost = grid[ni][nj] === 3 ? 3 : 1;
      let gNew = cell[i][j].g + cost;
      let hNew = calculateH(ni, nj, dest);
      let fNew = gNew + hNew;

      if (cell[ni][nj].f > fNew || isDestination(ni, nj, dest)) {
        open.push({ f: fNew, i: ni, j: nj });

        cell[ni][nj] = {
          f: fNew,
          g: gNew,
          h: hNew,
          parent_i: i,
          parent_j: j
        };
        if (isDestination(ni, nj, dest)) {
          return tracePath(cell, dest);
        }
      }
    }
  }

  console.log("A*: No path");
}

// ================= BEAM SEARCH =================

function beamSearch(grid, src, dest, k) {
  let closed = [];
  for (let i = 0; i < grid.length; i++) {
    closed[i] = [];
    for (let j = 0; j < grid[0].length; j++) {
      closed[i][j] = false;
    }
  }

  let cell = [];
  for (let i = 0; i < grid.length; i++) {
    cell[i] = [];
    for (let j = 0; j < grid[0].length; j++) {
      cell[i][j] = new Cell();
    }
  }

  let [i, j] = src;

  cell[i][j] = {
    f: 0,
    g: 0,
    h: 0,
    parent_i: i,
    parent_j: j
  };

  let open = [{ f: 0, i, j }];

  let dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
  ];

  while (open.length) {
    let newOpen = [];

    for (let node of open) {
      let { i, j } = node;

      closed[i][j] = true;

      for (let [di, dj] of dirs) {
        let ni = i + di,
          nj = j + dj;

        if (!isValid(grid, ni, nj) || !isValidCell(grid, ni, nj) || closed[ni][nj]) continue;

        let cost = grid[ni][nj] === 3 ? 3 : 1;
        let gNew = cell[i][j].g + cost;
        let hNew = calculateH(ni, nj, dest);
        let fNew = gNew + hNew;

        if (cell[ni][nj].f > fNew || isDestination(ni, nj, dest)) {
          cell[ni][nj] = {
            f: fNew,
            g: gNew,
            h: hNew,
            parent_i: i,
            parent_j: j
          };
          if (isDestination(ni, nj, dest)) {
            return tracePath(cell, dest);
          }
          newOpen.push({ f: fNew, i: ni, j: nj });
        }
      }
    }

    newOpen.sort((a, b) => a.f - b.f);

    open = newOpen.slice(0, k);
  }

  console.log("Beam Search: No path");
}
