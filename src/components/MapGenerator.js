const MAP_SIZE = 50;
const EMPTY = 0; // Cost: 1
const WALL = 1;  // Impassable
const SWAMP = 3; // Cost: 5

export class MapGenerator {
    static createBlankGrid() {
        return Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(EMPTY));
    }

    static generateOpenField() {
        return this.createBlankGrid();
    }

    static generateDeepTrap() {
        const grid = this.createBlankGrid();
        for (let r = 15; r <= 35; r++) grid[r][25] = WALL;
        for (let c = 15; c <= 25; c++) {
            grid[15][c] = WALL;
            grid[35][c] = WALL;
        }
        return grid;
    }

    static generateCostVariance() {
        const grid = this.createBlankGrid();
        for (let r = 5; r < 45; r++) {
            for (let c = 5; c < 45; c++) {
                grid[r][c] = SWAMP;
            }
        }
        return grid;
    }

    static generateWindingCorridor() {
        const grid = this.createBlankGrid();
        for (let r = 2; r < MAP_SIZE - 2; r += 4) {
            for (let c = 0; c < MAP_SIZE - 2; c++) grid[r][c] = WALL;
            for (let c = 2; c < MAP_SIZE; c++) grid[r + 2][c] = WALL;
        }
        return grid;
    }

    static generateImpossibleMap() {
        const grid = this.createBlankGrid();
        grid[48][49] = WALL;
        grid[49][48] = WALL;
        grid[48][48] = WALL;
        return grid;
    }
}

export const benchmarkMaps = [
    {
        name: "Random",
        grid: null, // Signals App.jsx to use generateMaze
        start: null,
        goal: null
    },
    {
        name: "The Open Field",
        grid: MapGenerator.generateOpenField(),
        start: [0, 0],
        goal: [49, 49]
    },
    {
        name: "The Deep Trap",
        grid: MapGenerator.generateDeepTrap(),
        start: [25, 10], 
        goal: [25, 40]   
    },
    {
        name: "The Cost Variance",
        grid: MapGenerator.generateCostVariance(),
        start: [0, 0],
        goal: [49, 49]
    },
    {
        name: "The Impossible Map",
        grid: MapGenerator.generateImpossibleMap(),
        start: [0, 0],
        goal: [49, 49]
    }
];
