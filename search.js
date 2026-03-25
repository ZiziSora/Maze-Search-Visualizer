class Cell {
  constructor() {
    this.parent_i = 0;
    this.parent_j = 0;
    this.f = Infinity;
    this.g = Infinity;
    this.h = 0;
  }
}

function isValid(grid, row, col) {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

function isValidCell(grid, row, col) {
  return grid[row][col] > 0;
}

function isDestination(row, col, dest) {
  return row === dest[0] && col === dest[1];
}

function calculateH(row, col, dest) {
  return Math.hypot(row - dest[0], col - dest[1]);
}

function printPath(path) {
  console.log(path.map((p) => `[${p[0]}, ${p[1]}]`).join(" -> "));
}

//A*

function tracePath(cellDetails, dest) {
  let path = [];
  let [row, col] = dest;

  while (
    !(
      cellDetails[row][col].parent_i === row &&
      cellDetails[row][col].parent_j === col
    )
  ) {
    path.push([row, col]);
    [row, col] = [
      cellDetails[row][col].parent_i,
      cellDetails[row][col].parent_j,
    ];
  }

  path.push([row, col]);
  path.reverse();

  console.log("A* Path:");
  printPath(path);
}

function aStarSearch(grid, src, dest) {
  let closed = Array.from({ length: grid.length }, () =>
    Array(grid[0].length).fill(false),
  );
  let cell = Array.from({ length: grid.length }, () =>
    Array.from({ length: grid[0].length }, () => new Cell()),
  );

  let [i, j] = src;

  cell[i][j] = { f: 0, g: 0, h: 0, parent_i: i, parent_j: j };

  let open = [{ f: 0, i, j }];

  let dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    ({ i, j } = open.shift());

    closed[i][j] = true;

    for (let [di, dj] of dirs) {
      let ni = i + di,
        nj = j + dj;

      if (
        !isValid(grid, ni, nj) ||
        !isValidCell(grid, ni, nj) ||
        closed[ni][nj]
      )
        continue;

      if (isDestination(ni, nj, dest)) {
        cell[ni][nj].parent_i = i;
        cell[ni][nj].parent_j = j;
        return tracePath(cell, dest);
      }

      let gNew = cell[i][j].g + grid[ni][nj];
      let hNew = calculateH(ni, nj, dest);
      let fNew = gNew + hNew;

      if (cell[ni][nj].f > fNew) {
        open.push({ f: fNew, i: ni, j: nj });

        cell[ni][nj] = {
          f: fNew,
          g: gNew,
          h: hNew,
          parent_i: i,
          parent_j: j,
        };
      }
    }
  }

  console.log("A*: No path");
}

//Beam search

class Path {
  constructor(nodes = [], cost = 0) {
    this.nodes = nodes;
    this.cost = cost;
  }
}

function beamSearch(grid, src, dest, k) {
  let dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  let paths = [new Path([src], 0)];

  while (paths.length) {
    let newPaths = [];

    for (let p of paths) {
      let [i, j] = p.nodes[p.nodes.length - 1];

      if (isDestination(i, j, dest)) {
        console.log("Beam Path:");
        printPath(p.nodes);
        console.log("Cost:", p.cost);
        return;
      }

      for (let [di, dj] of dirs) {
        let ni = i + di,
          nj = j + dj;

        if (!isValid(grid, ni, nj) || !isValidCell(grid, ni, nj)) continue;

        if (p.nodes.some(([x, y]) => x === ni && y === nj)) continue;

        let newCost = p.cost + grid[ni][nj];

        newPaths.push(new Path([...p.nodes, [ni, nj]], newCost));
      }
    }

    // Beam + heuristic
    newPaths.sort((a, b) => {
      let [ai, aj] = a.nodes[a.nodes.length - 1];
      let [bi, bj] = b.nodes[b.nodes.length - 1];

      let fA = a.cost + calculateH(ai, aj, dest);
      let fB = b.cost + calculateH(bi, bj, dest);

      return fA - fB;
    });

    paths = newPaths.slice(0, k);
  }

  console.log("Beam: No path");
}

//Test

let grid = [
  [1, 5, 1, 1],
  [2, 1, 10, 1],
  [1, 1, 1, 1],
  [0, 1, 2, 1],
];

let src = [0, 0];
let dest = [3, 3];

console.log("===== A* =====");
aStarSearch(grid, src, dest);

console.log("===== Beam (k=1) =====");
beamSearch(grid, src, dest, 1);

console.log("===== Beam (k=3) =====");
beamSearch(grid, src, dest, 3);
