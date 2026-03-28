// ==========================================
// THUẬT TOÁN BIDIRECTIONAL SEARCH
// ==========================================

const grid = [
    [0, 3, 1, 0, 0],
    [0, 0, 1, 3, 0],
    [1, 0, 0, 0, 1],
    [1, 3, 1, 0, 0],
    [1, 0, 0, 3, 0],
];

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

// Hàm nối vết đường đi từ 2 hướng lại với nhau
function buildPathGrid(parentF, parentB, intersectionKey, gridMap, exploredCount, exploredNodes) {
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
    while (curr !== null) {
        path.push(curr);
        curr = parentB[curr];
    }
    // Convert to [r, c]
    let finalPath = path.map(str => str.split(',').map(Number));
    
    // Compute Cost
    let pathCost = 0;
    for (let i = 1; i < finalPath.length; i++) {
        let [r, c] = finalPath[i];
        pathCost += gridMap[r][c] === 3 ? 3 : 1;
    }

    return { path: finalPath, pathCost, exploredCount, exploredNodes };
}

// Bidirectional Search
function bidirectionalSearchGrid(gridMap, start, goal) {
    let startKey = `${start[0]},${start[1]}`;
    let goalKey = `${goal[0]},${goal[1]}`;

    if (startKey === goalKey) return { path: [start], pathCost: 0, exploredCount: 0, exploredNodes: [] };

    let queueF = [start]; // Hàng đợi từ Start
    let queueB = [goal];  // Hàng đợi từ Goal

    let parentF = {}; 
    let parentB = {}; 
    
    parentF[startKey] = null;
    parentB[goalKey] = null;  

    let exploredCount = 0;
    let exploredNodes = [];

    while (queueF.length > 0 && queueB.length > 0) {
        
        // Forward
        let currentF = queueF.shift();
        let currFKey = `${currentF[0]},${currentF[1]}`;
        exploredCount++;
        exploredNodes.push([currentF[0], currentF[1]]);
        let neighborsF = getNeighbors(currentF[0], currentF[1], gridMap);
        
        for (let [nr, nc] of neighborsF) {
            let neighborKey = `${nr},${nc}`;
            if (parentF[neighborKey] === undefined) {
                parentF[neighborKey] = currFKey; 
                queueF.push([nr, nc]);        

                // Gặp nhau
                if (parentB[neighborKey] !== undefined) {
                    return buildPathGrid(parentF, parentB, neighborKey, gridMap, exploredCount, exploredNodes);
                }
            }
        }

        // Backward
        let currentB = queueB.shift();
        let currBKey = `${currentB[0]},${currentB[1]}`;
        exploredCount++;
        exploredNodes.push([currentB[0], currentB[1]]);
        let neighborsB = getNeighbors(currentB[0], currentB[1], gridMap);
        
        for (let [nr, nc] of neighborsB) {
            let neighborKey = `${nr},${nc}`;
            if (parentB[neighborKey] === undefined) {
                parentB[neighborKey] = currBKey;
                queueB.push([nr, nc]);      

                // Gặp nhau
                if (parentF[neighborKey] !== undefined) {
                    return buildPathGrid(parentF, parentB, neighborKey, gridMap, exploredCount, exploredNodes);
                }
            }
        }
    }
    return { path: [], pathCost: 0, exploredCount, exploredNodes };
}

export { bidirectionalSearchGrid };