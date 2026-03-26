const EMPTY = 0;
const WALL = 1;
const START = 2;
const SWAMP = 3
const GOAL = 4;


/* 
    const maze = [
    [2, 0, 0, 1, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 1, 3]
    
    ];
*/

/*
Quy ước Output cho mọi hàm thuật toán:
return {
    path: [[y, x], ...],                    //Mảng chứa tọa độ đường đi đúng
    exploredNodes: [[y, x], ...],           //Mảng chứa thứ tự các node được duyệt qua
    cost: 0,                                //Tổng chi phí đường đi
    time: 0.0                               //Thời gian đi
};
*/