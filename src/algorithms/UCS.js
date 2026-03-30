// ==========================================
// THUẬT TOÁN UNIFORM COST SEARCH (UCS) (UPDATED)
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
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
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
    // Sắp xếp để phần tử có chi phí nhỏ nhất luôn nổi lên đầu
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    // GIỮ NGUYÊN LOGIC CŨ: Chỉ trả về item
    return this.elements.shift().item;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

// UCS
export function uniformCostSearchGrid(gridMap, start, goal) {
  const startTime = performance.now(); // Bắt đầu đếm giờ
  let exploredNodes = []; // Mảng lưu các node đã duyệt

  let pq = new PriorityQueue();
  let startKey = `${start[0]},${start[1]}`;
  let goalKey = `${goal[0]},${goal[1]}`;

  pq.enqueue({ pos: start, path: [startKey] }, 0);

  let minCosts = {};
  minCosts[startKey] = 0;

  while (!pq.isEmpty()) {
    // GIỮ NGUYÊN LOGIC CŨ
    let { pos, path } = pq.dequeue();

    // Push toạ độ hiện tại vào exploredNodes
    exploredNodes.push(pos);

    let [r, c] = pos;
    let currentKey = `${r},${c}`;
    let currentCost = minCosts[currentKey]; // Lấy cost theo logic cũ

    if (currentKey === goalKey) {
      const endTime = performance.now();
      // Convert path từ mảng string ("r,c") sang mảng số ([r, c])
      const finalPath = path.map(p => p.split(",").map(Number));

      // FORMAT RETURN LẠI THEO CHUẨN MỚI
      return {
        path: finalPath,
        pathLength: finalPath.length,
        exploredNodes: exploredNodes,
        exploredCount: exploredNodes.length,
        pathCost: currentCost,
        time: endTime - startTime,
        noPath: false
      };
    }

    let neighbors = getNeighbors(r, c, gridMap);
    for (let [nr, nc] of neighbors) {
      let neighborKey = `${nr},${nc}`;
      let stepCost = getCost(gridMap[nr][nc]);
      let newCost = currentCost + stepCost;

      // Update
      if (minCosts[neighborKey] === undefined || newCost < minCosts[neighborKey]) {
        minCosts[neighborKey] = newCost;
        let newPath = [...path, neighborKey];
        pq.enqueue({ pos: [nr, nc], path: newPath }, newCost);
      }
    }
  }

  // Nếu không tìm thấy đường đi
  const endTime = performance.now();

  // FORMAT RETURN LẠI THEO CHUẨN MỚI
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
