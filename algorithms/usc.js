// ==========================================
// THUẬT TOÁN UNIFORM COST SEARCH (UCS)
// ==========================================

const grid = [
    [0, 3, 1, 0, 0],
    [0, 0, 1, 3, 0],
    [1, 0, 0, 0, 1],
    [1, 3, 1, 0, 0],
    [1, 0, 0, 3, 0],
];

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
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

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
        return this.elements.shift().item;
    }
    isEmpty() {
        return this.elements.length === 0;
    }
}

// UCS
function uniformCostSearchGrid(gridMap, start, goal) {
    let pq = new PriorityQueue();
    let startKey = `${start[0]},${start[1]}`;
    let goalKey = `${goal[0]},${goal[1]}`;

    pq.enqueue({ pos: start, path: [startKey] }, 0);

    let minCosts = {};
    minCosts[startKey] = 0;

    while (!pq.isEmpty()) {
        let { pos, path } = pq.dequeue();
        let [r, c] = pos;
        let currentKey = `${r},${c}`;
        let currentCost = minCosts[currentKey];

        if (currentKey === goalKey) {
            return { path: path, totalCost: currentCost };
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
    return null; 
}

// Test
const startNode = [0, 0];
const goalNode = [4, 4];
const ucsResult = uniformCostSearchGrid(grid, startNode, goalNode);

console.log("=== KẾT QUẢ UCS ===");
if (ucsResult) {
    console.log(`Đường đi: [${ucsResult.path.join("] -> [")}]`);
    console.log(`Tổng chi phí: ${ucsResult.totalCost}`);
} else {
    console.log("Không tìm thấy đường đi!");
}