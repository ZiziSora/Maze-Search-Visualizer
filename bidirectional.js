function buildPath(parentF, parentB, intersectionNode) {
    let path = [];
    
    // 1. Lần ngược vết từ Điểm giao (Intersection) về Start
    let curr = intersectionNode;
    while (curr !== null) {
        path.push(curr);
        curr = parentF[curr]; 
    }
    path.reverse(); // reverse

    // 2. Lần vết từ Điểm giao tiến về Goal
    curr = parentB[intersectionNode]; 
    while (curr !== null) {
        path.push(curr);
        curr = parentB[curr];
    }
    
    return path;
}

// Bidirectional Search
function bidirectionalSearch(graph, start, goal) {
    if (start === goal) return [start];

    
    let queueF = [start]; // Forward
    let queueB = [goal];  // Backward 

    // Objects to save
    let parentF = {}; 
    let parentB = {}; 
    
    parentF[start] = null;
    parentB[goal] = null;  

    // No way to go
    while (queueF.length > 0 && queueB.length > 0) {
        // (FORWARD)
        let currentF = queueF.shift(); 
        let neighborsF = graph[currentF];
        
        for (let i = 0; i < neighborsF.length; i++) {
            let neighbor = neighborsF[i];
            
            
            if (parentF[neighbor] === undefined) {
                parentF[neighbor] = currentF; 
                queueF.push(neighbor);        

                if (parentB[neighbor] !== undefined) {
                    console.log("Hai đội chạm mặt tại đỉnh:", neighbor);
                    return buildPath(parentF, parentB, neighbor);
                }
            }
        }
        // (BACKWARD)
        let currentB = queueB.shift();
        let neighborsB = graph[currentB];
        
        for (let i = 0; i < neighborsB.length; i++) {
            let neighbor = neighborsB[i];
            
            if (parentB[neighbor] === undefined) {
                parentB[neighbor] = currentB;
                queueB.push(neighbor);      

                if (parentF[neighbor] !== undefined) {
                    console.log("Hai đội chạm mặt tại đỉnh:", neighbor);
                    return buildPath(parentF, parentB, neighbor);
                }
            }
        }
    }

    return null;
}


// Undirected Graph
const graph = {
    'S': ['A', 'D'],
    'A': ['S', 'B'],
    'B': ['A', 'C'],
    'C': ['B', 'G'], // Đường S -> A -> B -> C -> G
    'D': ['S', 'E'],
    'E': ['D', 'F'],
    'F': ['E', 'G'], // Đường S -> D -> E -> F -> G
    'G': ['C', 'F']
};

const path = bidirectionalSearch(graph, 'S', 'G');
console.log("Đường đi tìm được:", path.join(" -> "));