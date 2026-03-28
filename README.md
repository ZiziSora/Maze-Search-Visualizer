# 🐭 Tom & Jerry Maze Search Visualizer 🧀

An interactive, feature-rich web application built with **React** to visualize and benchmark classic Graph Search & Pathfinding Algorithms. Watch as the search dynamically expands across complex grid environments, and enjoy a smooth 2D animation of Jerry sprinting to the cheese once the optimal path is found!

## 🌟 Key Features

* **8 Pathfinding Algorithms**: Compare the performance and behavior of:
  * Breadth-First Search (BFS)
  * Depth-First Search (DFS)
  * Uniform Cost Search (UCS)
  * A* Search
  * Beam Search
  * Iterative Deepening A* (IDA*)
  * Iterative Deepening DFS (IDDFS)
  * Bidirectional Search
* **Dynamic Grid Generation**: Use intuitive left-panel sliders to immediately generate random graphs of any size (up to 51x51) and inject custom densities of high-cost **"Puddles"** `(Cost: 3)`.
* **4 Academic Benchmark Maps**: Switch from random generation to meticulously designed hardcoded test cases to observe how algorithms handle specific topological edge cases:
  1. **The Open Field** (51x51): Massive empty space to test exponential blowup.
  2. **The Deep Trap** (51x51): A complex serpentine labyrinth enforcing deep recursion.
  3. **The Cost Variance** (21x21): A map heavily infested with puddle hazards to test weighted search (UCS/A*).
  4. **The Impossible Map** (21x21): A completely walled-off target.
* **Smart UI Constraints**: Built-in algorithmic guardrails. `IDDFS` and `IDA*` are natively restricted/hidden when you select massive open-field maps to accurately demonstrate their theoretical limits and prevent browser crashes caused by $O(b^d)$ exponential path cycling!
* **Real-time Metrics**: Compare the granular efficiency of algorithms with an automatic tracking sidebar that mathematically sanitizes:
  * Total Cells Visited
  * Final Path Cost
  * Exact Path Length
  * Execution Time (ms)
* **Smooth 2D Sprite Animation**: Jerry is decoupled from the canvas and smoothly glides across the HTML DOM in a cinematic, frame-throttled chase sequence once the target is located!

---

## 🚀 Getting Started

To run the visualizer locally on your machine, you must have [Node.js](https://nodejs.org/) installed.

1. **Install Dependencies**
   Navigate into the project directory and install the necessary React packages:
   ```bash
   npm install
   ```

2. **Start the Development Server**
   Run the local Vite/React development environment:
   ```bash
   npm run dev
   ```

3. **Open the App**
   Open your browser and navigate to `http://localhost:5173`.

---

## 🎮 How to Use

1. **Choose a Map / Size**: 
   - By default, you start with a **Random** map. You can tweak the **Grid Size** and **Puddle Density** sliders to randomly generate infinite configurations.
   - Alternatively, use the **Choose A Map** dropdown to load one of the 4 static benchmark maps.
2. **Select an Algorithm**: 
   - Choose your pathfinding strategy from the **Choose An Algorithm** dropdown. *(Note: Unoptimized algorithms like IDDFS and IDA* will automatically hide themselves if you select an impossibly large map!)*
3. **Adjust the Speed**: 
   - Slow down the speed slider if you want to carefully watch the algorithm step-by-step, or max it out to skip straight to the end!
4. **Run**: 
   - Click the **▶ Run** button. 
   - The map will light up with **Light Blue** tiles representing the algorithm's active exploration frontier. 
   - **Fun Fact:** If you run an Iterative algorithm (like IDA*), you will notice the blue squares stacking on top of each other and turning **Dark Blue**. This forms a native heat-map showing exactly which tiles the algorithm wasted the most time recalculating!
5. **The Chase**: 
   - Once the cheese is found, the algorithm traces a **Green** path backwards and Jerry automatically sprints down it!

## 🧩 Map Legend

- 🧱 **Wall**: Impassable terrain.
- ⬜ **Open Path**: Standard traversal tile. `Cost: 1`.
- 💦 **Puddle**: Hazardous swamp tile. `Cost: 3`. Algorithms like A* and UCS will prioritize longer routes to avoid these!
- 🐭 **Jerry**: The Start node.
- 🧀 **Cheese**: The Goal node.
- 🟦 **Visited**: Shows the exploration sequence (`Light blue` = visited once, `Dark blue` = visited repeatedly).
- 🟧 **Backtracked**: Areas DFS retreated from after hitting a dead end.
