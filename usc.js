class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(item, priority) {
        this.elements.push({ item, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().item;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

function uniformCostSearch(graph, start, goal) {
    let pq = new PriorityQueue();

    pq.enqueue([start, [start]], 0);

    let minCosts = {};
    minCosts[start] = 0;

    while (!pq.isEmpty()) {
        let [currentNode, path] = pq.dequeue();
        let currentCost = minCosts[currentNode];

        if (currentNode === goal) {
            return {
                path: path,
                totalCost: currentCost
            };
        }

        let neighbors = graph[currentNode];
        for (let neighbor in neighbors) {
            let stepCost = neighbors[neighbor];
            let newCost = currentCost + stepCost;

            if (minCosts[neighbor] === undefined || newCost < minCosts[neighbor]) {
                minCosts[neighbor] = newCost;

                let newPath = [...path, neighbor]; 
                
                pq.enqueue([neighbor, newPath], newCost);
            }
        }
    }

    return null; 
}



// Biểu diễn đồ thị bằng Adjacency List (Danh sách kề) chứa trọng số
const graph = {
    'S': { 'A': 1, 'B': 5, 'C': 15 },
    'A': { 'G': 10 },
    'B': { 'G': 5 },
    'C': { 'G': 2 },
    'G': {} 
};

const result = uniformCostSearch(graph, 'S', 'G');

if (result) {
    console.log("Đường đi ngắn nhất:", result.path.join(" -> "));
    console.log("Tổng chi phí:", result.totalCost);
} else {
    console.log("Không tìm thấy đường đi!");
}