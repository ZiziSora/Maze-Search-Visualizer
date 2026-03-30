// ==========================================
// THUẬT TOÁN BIDIRECTIONAL SEARCH (UPDATED)
// ==========================================

const grid = [
  [0, 3, 1, 0, 0],
  [0, 0, 1, 3, 0],
  [1, 0, 0, 0, 1],
  [1, 3, 1, 0, 0],
  [1, 0, 0, 3, 0]
];

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

// Hàm nối vết đường đi từ 2 hướng lại với nhau và convert ra mảng [r, c]
function buildPathGrid(parentF, parentB, intersectionKey) {
  let path = [];

  // 1. Lần ngược vết từ điểm chạm nhau về Start
  let curr = intersectionKey;
  while (curr !== null) {
    path.push(curr);
    curr = parentF[curr];
  }
  path.reverse();

  // 2. Lần vết từ điểm chạm nhau tiến về Goal
  curr = parentB[intersectionKey];
  // Bỏ qua node giao điểm để không bị lặp (LOGIC CŨ)
  curr = parentB[curr];
  while (curr !== null) {
    path.push(curr);
    curr = parentB[curr];
  }

  // Convert từ chuỗi "r,c" sang mảng [r, c]
  return path.map(key => key.split(",").map(Number));
}

// Bidirectional Search
export function bidirectionalSearchGrid(gridMap, start, goal) {
  const startTime = performance.now(); // Bắt đầu đếm giờ
  let exploredNodes = []; // Mảng lưu các node đã duyệt

  let startKey = `${start[0]},${start[1]}`;
  let goalKey = `${goal[0]},${goal[1]}`;

  if (startKey === goalKey) {
    const endTime = performance.now();
    return {
      path: [start],
      pathLength: 1,
      exploredNodes: [start],
      exploredCount: 1,
      pathCost: 0,
      time: endTime - startTime,
      noPath: false
    };
  }

  let queueF = [start]; // Hàng đợi từ Start
  let queueB = [goal]; // Hàng đợi từ Goal

  let parentF = {};
  let parentB = {};

  parentF[startKey] = null;
  parentB[goalKey] = null;

  while (queueF.length > 0 && queueB.length > 0) {
    // Forward
    let currentF = queueF.shift();
    exploredNodes.push(currentF); // Đưa node vào mảng đã duyệt

    let currFKey = `${currentF[0]},${currentF[1]}`;
    let neighborsF = getNeighbors(currentF[0], currentF[1], gridMap);

    for (let [nr, nc] of neighborsF) {
      let neighborKey = `${nr},${nc}`;
      if (parentF[neighborKey] === undefined) {
        parentF[neighborKey] = currFKey;
        queueF.push([nr, nc]);

        // Gặp nhau
        if (parentB[neighborKey] !== undefined) {
          const finalPath = buildPathGrid(parentF, parentB, neighborKey);
          const endTime = performance.now();
          return {
            path: finalPath,
            pathLength: finalPath.length,
            exploredNodes: exploredNodes,
            exploredCount: exploredNodes.length,
            pathCost: finalPath.length - 1, // Chi phí tính theo logic cũ
            time: endTime - startTime,
            noPath: false
          };
        }
      }
    }

    // Backward
    let currentB = queueB.shift();
    exploredNodes.push(currentB); // Đưa node vào mảng đã duyệt

    let currBKey = `${currentB[0]},${currentB[1]}`;
    let neighborsB = getNeighbors(currentB[0], currentB[1], gridMap);

    for (let [nr, nc] of neighborsB) {
      let neighborKey = `${nr},${nc}`;
      if (parentB[neighborKey] === undefined) {
        parentB[neighborKey] = currBKey;
        queueB.push([nr, nc]);

        // Gặp nhau
        if (parentF[neighborKey] !== undefined) {
          const finalPath = buildPathGrid(parentF, parentB, neighborKey);
          const endTime = performance.now();
          return {
            path: finalPath,
            pathLength: finalPath.length,
            exploredNodes: exploredNodes,
            exploredCount: exploredNodes.length,
            pathCost: finalPath.length - 1, // Chi phí tính theo logic cũ
            time: endTime - startTime,
            noPath: false
          };
        }
      }
    }
  }

  // Nếu không tìm thấy đường đi
  const endTime = performance.now();
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
