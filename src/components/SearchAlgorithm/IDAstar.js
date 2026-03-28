const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

export function IDAStar(maze, start, goal) {
  const history = [];
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
    history.push({ r: x, c: y, type: 'visit' });      // ADD

    const f = g + heuristic(x, y);
    if (f > threshold) {
      history.push({ r: x, c: y, type: 'backtrack' }); // ADD — pruned by threshold
      return f;
    }
    if (x === goal[0] && y === goal[1]) {
      history.push({ r: x, c: y, type: 'target' });    // ADD
      return "FOUND";
    }

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
        history.push({ r: x, c: y, type: 'backtrack' }); // ADD — dead end
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
    history,
    cost,
    time: performance.now() - timeStart,
  };
}