// maze

const BFS = (maze, start, goal) => {
  const V = maze.length;
  const queue = [start];
  let visit = new Set();
  visit.add(`${start[0]},${start[1]}`);
  let parent = {};

  let cost = 0;
  const path = [];
  const exploredNodes = [];
  let timeStart = performance.now();
  let dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
  ];

  while (queue.length > 0) {
    const curr = queue.shift();
    let [x, y] = curr;
    exploredNodes.push([x, y]);

    if (x === goal[0] && y === goal[1]) {
      let currKey = `${x},${y}`;

      while (currKey !== `${start[0]},${start[1]}`) {
        let [cx, cy] = currKey.split(",").map(Number);
        path.unshift([cx, cy]);
        currKey = parent[currKey];
      }

      path.unshift(start);
      break;
    }

    for (let [dx, dy] of dirs) {
      let nx = x + dx,
        ny = y + dy;
      let key = `${nx},${ny}`;

      if (nx >= 0 && nx < maze.length && ny >= 0 && ny < maze[0].length) {
        if (maze[nx][ny] !== 1 && !visit.has(key)) {
          visit.add(key);
          queue.push([nx, ny]);
          parent[key] = `${x},${y}`;
        }
      }
    }
  }

  // LOGIC TÍNH COST THEO ĐỊA HÌNH
  let finalCost = 0;
  if (path.length > 0) {
    for (let i = 1; i < path.length; i++) {
      let [px, py] = path[i];
      let terrainType = maze[px][py];

      if (terrainType === 3) {
        finalCost += 3; // Đầm lầy
      } else {
        finalCost += 1; // Đường trống
      }
    }
  }

  return {
    path,
    pathLength: path.length,
    exploredCount: exploredNodes.length,
    pathCost: finalCost,
    exploredNodes,
    time: performance.now() - timeStart,
    noPath: path.length === 0
  };
};

export { BFS };
