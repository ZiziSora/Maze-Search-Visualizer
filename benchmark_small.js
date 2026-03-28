import { BFS } from './algorithms/BFS.js'
import { aStarSearch } from './algorithms/search.js';
import { IDAStar } from './algorithms/IDAStar.js';
import { IDDFS } from './algorithms/IDDFS.js';

const MAP_SIZE = 10;
const EMPTY = 0; // Cost: 1
const WALL = 1;  // Impassable

class MapGenerator {
    static createBlankGrid() {
        return Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(EMPTY));
    }
    static generateMiniMap() {
        const grid = this.createBlankGrid();
        // Add a small wall in the middle
        grid[4][4] = WALL;
        grid[5][4] = WALL;
        grid[6][4] = WALL;
        return grid;
    }
}

const testMap = [
    {
        name: "Mini Map (Targeted for IDA* / IDDFS)",
        grid: MapGenerator.generateMiniMap(),
        start: [0, 0],
        goal: [9, 9]
    }
];

class BenchmarkRunner {
  static testAlgorithm(algorithmName, algorithmFunction, grid, start, goal) {
    const startTime = performance.now();
    const result = algorithmFunction(grid, start, goal);
    const endTime = performance.now();
    const timeTakenMs = (endTime - startTime).toFixed(2);

    return {
      "Algorithm": algorithmName,
      "Path Found": result.path.length > 0 ? "Yes" : "No",
      "Path Cost": result.pathCost,
      "Explored Nodes": result.exploredCount,
      "Time (ms)": parseFloat(timeTakenMs)
    };
  }

  static runAllBenchmarks(algorithms, mapsConfig) {
    console.log("🚀 Starting Mini Benchmark specifically for IDA* & IDDFS...\n");

    for (const testCase of mapsConfig) {
      console.log(`========================================================`);
      console.log(`📍 MAP: ${testCase.name}`);
      console.log(`========================================================`);
      
      const resultsTable = [];

      for (const algo of algorithms) {
        try {
          const gridCopy = testCase.grid.map(row => [...row]);
          const metrics = this.testAlgorithm(algo.name, algo.fn, gridCopy, testCase.start, testCase.goal);
          resultsTable.push(metrics);
        } catch (error) {
          console.error(`❌ Error running ${algo.name}:`, error.message);
        }
      }
      console.table(resultsTable);
      console.log("\n");
    }
  }
}

const testAlgorithms = [
  { name: "BFS (Baseline)", fn: BFS },
  { name: "A* (Baseline)", fn: aStarSearch },
  { name: "IDA*", fn: IDAStar },
  { name: "IDDFS", fn: IDDFS }
];

BenchmarkRunner.runAllBenchmarks(testAlgorithms, testMap); 
