const IDDFS = (maze, start, goal) => {
  let timeStart = performance.now();
  let maxLength = maze.length * maze[0].length;
  let exploredNodes = [];
  let path = [];

  const DLS = (src, target, limit, visited, currentPath) => {
    let [x, y] = src;
    exploredNodes.push([x, y]);

    if (src[0] === target[0] && src[1] === target[1]) {
      path = [...currentPath];
      return true;
    }

    if (limit <= 0) return false;

    const dirs = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1]
    ];

    for (let [dx, dy] of dirs) {
      let nx = src[0] + dx,
        ny = src[1] + dy;
      let key = `${nx},${ny}`;

      if (nx >= 0 && nx < maze.length && ny >= 0 && ny < maze[0].length) {
        if (maze[nx][ny] !== 1 && !visited.has(key)) {
          visited.add(key);
          currentPath.push([nx, ny]);

          if (DLS([nx, ny], target, limit - 1, visited, currentPath)) {
            return true;
          }

          currentPath.pop();
          visited.delete(key);
        }
      }
    }
    return false;
  };

  for (let limit = 0; limit < maxLength; limit++) {
    let visited = new Set();
    visited.add(`${start[0]},${start[1]}`);
    let currentPath = [start];

    if (DLS(start, goal, limit, visited, currentPath)) {
      break;
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

  // FORMAT RETURN LẠI THEO CHUẨN MỚI
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

export { IDDFS };
