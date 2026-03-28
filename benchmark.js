// ======================================================================
// 1. IMPORT YOUR ALGORITHMS
// Adjust these paths depending on your exact project structure.
// ======================================================================
import { BFS } from './algorithms/BFS.js'
import { DFS } from './algorithms/DFS.js';
import { uniformCostSearchGrid } from './algorithms/UCS.js';
import { aStarSearch, beamSearch } from './algorithms/search.js';
import { IDAStar } from './algorithms/IDAStar.js';
import { IDDFS } from './algorithms/IDDFS.js';
import { bidirectionalSearchGrid } from './algorithms/bidirectional.js';
// ======================================================================
// 2. MAP GENERATORS
// 0 = Normal (Cost 1), 1 = Obstacle (Impassable), 2 = Swamp (Cost 3)
// ======================================================================

const MAP_SIZE = 50;
const EMPTY = 0; // Cost: 1
const WALL = 1;  // Impassable
const SWAMP = 3; // Cost: 5

class MapGenerator {
    // Helper function to create a blank 50x50 grid
    static createBlankGrid() {
        return Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(EMPTY));
    }

    // 1. The "Open Field" (No Obstacles)
    // Tests baseline efficiency and heuristic speed.
    static generateOpenField() {
        return this.createBlankGrid();
    }

    // 2. The "Deep Trap" (U-Shaped Wall)
    // Tests how algorithms handle local minimums and dead ends.
    static generateDeepTrap() {
        const grid = this.createBlankGrid();

        // Draw a massive U-shaped wall in the middle of the map
        // Assuming Start is (10, 25) and Goal is (40, 25)
        for (let r = 15; r <= 35; r++) {
            grid[r][25] = WALL; // Back of the U
        }
        for (let c = 15; c <= 25; c++) {
            grid[15][c] = WALL; // Top arm of the U
            grid[35][c] = WALL; // Bottom arm of the U
        }
        return grid;
    }

    // 3. The "Cost Variance" Map (Swamps and Roads)
    // Crucial for showing the difference between BFS and UCS/A*.
    static generateCostVariance() {
        const grid = this.createBlankGrid();

        // Fill the massive center area with high-cost "swamp" (5)
        for (let r = 5; r < 45; r++) {
            for (let c = 5; c < 45; c++) {
                grid[r][c] = SWAMP;
            }
        }

        // The edges remain 0 (Cost 1), creating a fast "highway" around the swamp.
        // BFS will go straight through the swamp. UCS/A* will take the highway.
        return grid;
    }

    // 4. The "Perfect Maze" (Long Winding Corridor)
    // Tests processing overhead and queue/stack management.
    static generateWindingCorridor() {
        const grid = this.createBlankGrid();

        // Creates a snake-like pattern of alternating walls
        // Forcing the algorithms down a single, incredibly long path
        for (let r = 2; r < MAP_SIZE - 2; r += 4) {
            for (let c = 0; c < MAP_SIZE - 2; c++) {
                grid[r][c] = WALL;      // Wall leaving a gap on the right
            }
            for (let c = 2; c < MAP_SIZE; c++) {
                grid[r + 2][c] = WALL;  // Wall leaving a gap on the left
            }
        }
        return grid;
    }

    // 5. The "Impossible Map" (No Solution)
    // Tests completeness and worst-case memory usage.
    static generateImpossibleMap() {
        const grid = this.createBlankGrid();

        // Assuming the Goal is at the bottom right corner (49, 49)
        // We completely wall it off so no algorithm can reach it.
        grid[48][49] = WALL;
        grid[49][48] = WALL;
        grid[48][48] = WALL;

        return grid;
    }
}

//console.log(MapGenerator.generateOpenField());

const testMap = [
    {
        name: "1. The Open Field",
        grid: MapGenerator.generateOpenField(),
        start: [0, 0],
        goal: [49, 49]
    },
    {
        name: "2. The Deep Trap",
        grid: MapGenerator.generateDeepTrap(),
        start: [25, 10], // Inside the U-shape
        goal: [25, 40]   // Outside the U-shape
    },
    {
        name: "3. The Cost Variance (Swamps)",
        grid: MapGenerator.generateCostVariance(),
        start: [0, 0],
        goal: [49, 49]
    },
    {
        name: "4. The Impossible Map",
        grid: MapGenerator.generateImpossibleMap(),
        start: [0, 0],
        goal: [49, 49]
    }
];
class BenchmarkRunner {
  /**
   * Executes a single search algorithm on a given map and records performance metrics.
   * Your search algorithms should return an object like:
   * { path: [[r,c], [r,c]...], exploredCount: number, pathCost: number }
   */
  static testAlgorithm(algorithmName, algorithmFunction, grid, start, goal, iterations = 10) {
    let totalTime = 0;
    let finalResult = null;

    for (let i = 0; i < iterations; i++) {
        // Clone to ensure a fresh grid space on every run
        const gridCopy = grid.map(row => [...row]); 
        
        const startTime = performance.now();
        finalResult = algorithmFunction(gridCopy, start, goal);
        totalTime += (performance.now() - startTime);
    }
    
    const avgTimeMs = (totalTime / iterations).toFixed(2);

    return {
      "Algorithm": algorithmName,
      "Path Found": finalResult.path.length > 0 ? "Yes" : "No",
      "Path Cost": finalResult.pathCost,
      "Explored Nodes": finalResult.exploredCount,
      "Time (ms)": parseFloat(avgTimeMs)
    };
  }

  /**
   * Runs all provided algorithms against all provided maps and prints tables.
   */
  static runAllBenchmarks(algorithms, mapsConfig) {
    console.log("🚀 Starting Search Algorithm Benchmark...\n");

    for (const testCase of mapsConfig) {
      console.log(`========================================================`);
      console.log(`📍 MAP: ${testCase.name}`);
      console.log(`========================================================`);
      
      const resultsTable = [];

      for (const algo of algorithms) {
        try {
          // Pass the original grid down; testAlgorithm will handle cloning per iteration
          const metrics = this.testAlgorithm(
            algo.name, 
            algo.fn, 
            testCase.grid, 
            testCase.start, 
            testCase.goal,
            10 // Run 10 iterations for a stable average
          );
          resultsTable.push(metrics);
        } catch (error) {
          console.error(`❌ Error running ${algo.name} on ${testCase.name}:`, error.message);
          resultsTable.push({
            "Algorithm": algo.name,
            "Path Found": "ERROR",
            "Path Cost": "-",
            "Explored Nodes": "-",
            "Time (ms)": "-"
          });
        }
      }

      // This will print a beautiful ASCII table directly in your console/terminal
      console.table(resultsTable);
      console.log("\n");
    }
  }
}
const myAlgorithms = [
  { name: "BFS", fn: BFS },
  { name: "DFS", fn: DFS },
  { name: "UCS", fn: uniformCostSearchGrid },
  { name: "A*", fn: aStarSearch },
  { name: "Beam Search", fn: beamSearch },
  // { name: "IDA*", fn: IDAStar }, // Warning: O(b^d) freezes Node.js on a 50x50 map!
  // { name: "IDDFS", fn: IDDFS },  // Warning: O(b^d) freezes Node.js on a 50x50 map!
  { name: "Bidirectional", fn: bidirectionalSearchGrid }
];

BenchmarkRunner.runAllBenchmarks(myAlgorithms, testMap); 