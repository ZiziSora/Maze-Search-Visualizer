import { IDDFS } from "./algorithms/IDDFS.js";


const maze = [
    [2, 0, 0, 1, 0],
    [1, 1, 0, 1, 0],
    [0, 3, 0, 3, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 1, 4]
    
];

console.log(IDDFS(maze, [0,0],[4,4]));