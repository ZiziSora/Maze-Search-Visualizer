// ==========================================
// THUẬT TOÁN UNIFORM COST SEARCH (UCS) - FIXED
// ==========================================

// Convert cost
function getCost(val) {
  if (val === 0) return 1;
  if (val === 3) return 3;
  return Infinity;
}

// Neighbor
function getNeighbors(r, c, gridMap) {
  const rows = gridMap.length;
  const cols = gridMap[0].length;
  const neighbors = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];

  for (let [dr, dc] of directions) {
    let nr = r + dr;
    let nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && gridMap[nr][nc] !== 1) {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

// Create Queue
class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    // SỬA: Trả về toàn bộ object để lấy được cả item và priority
    return this.elements.shift();
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

// UCS
export function uniformCostSearchGrid(gridMap, start, goal) {
  const startTime = performance.now();
  let exploredNodes = [];

  let pq = new PriorityQueue();
  let startKey = `${start[0]},${start[1]}`;
  let goalKey = `${goal[0]},${goal[1]}`;

  pq.enqueue({ pos: start, path: [startKey] }, 0);

  let minCosts = {};
  minCosts[startKey] = 0;

  while (!pq.isEmpty()) {
    // SỬA: Lấy node và chi phí thực của nó tại thời điểm enqueue
    let { item, priority } = pq.dequeue();
    let { pos, path } = item;
    let currentCost = priority;

    let [r, c] = pos;
    let currentKey = `${r},${c}`;

    // QUAN TRỌNG: Nếu chi phí này lớn hơn chi phí nhỏ nhất đã tìm thấy cho node này, bỏ qua.
    // Đây là bước ngăn chặn việc duyệt lại các "node rác" cũ trong Queue.
    if (currentCost > minCosts[currentKey]) continue;

    exploredNodes.push(pos);

    if (currentKey === goalKey) {
      const endTime = performance.now();
      const finalPath = path.map(p => p.split(",").map(Number));

      return {
        path: finalPath,
        pathLength: finalPath.length,
        exploredNodes: exploredNodes,
        exploredCount: exploredNodes.length,
        pathCost: currentCost,
        time: endTime - startTime,
        noPath: false // Thêm để đồng bộ với các file khác
      };
    }

    let neighbors = getNeighbors(r, c, gridMap);
    for (let [nr, nc] of neighbors) {
      let neighborKey = `${nr},${nc}`;
      let stepCost = getCost(gridMap[nr][nc]);
      let newCost = currentCost + stepCost;

      if (minCosts[neighborKey] === undefined || newCost < minCosts[neighborKey]) {
        minCosts[neighborKey] = newCost;
        let newPath = [...path, neighborKey];
        pq.enqueue({ pos: [nr, nc], path: newPath }, newCost);
      }
    }
  }

  const endTime = performance.now();
  // SỬA: Trả về đầy đủ các key để tránh lỗi khi render UI
  return { 
    path: [], 
    pathLength: 0, 
    exploredNodes: exploredNodes, 
    exploredCount: exploredNodes.length, 
    pathCost: 0, 
    time: endTime - startTime, 
    noPath: true 
  };
}