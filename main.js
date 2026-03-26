import { BFS } from "./algorithms/BFS.js";
import { IDDFS } from "./algorithms/IDDFS.js";

// ==========================================
// 1. KỊCH BẢN 1: CÁNH ĐỒNG TRỐNG (Tự động sinh mảng NxN)
// ==========================================
function generateOpenGrid(size) {
    // Tạo mảng 2D toàn số 0 (đường đi)
    return Array(size).fill().map(() => Array(size).fill(0));
}
const mapOpen = generateOpenGrid(20); // Test mảng 20x20
// Start: [0, 0], Goal: [19, 19]


// ==========================================
// 2. KỊCH BẢN 2: BẪY CHỮ U (The U-Trap)
// ==========================================
// Tường bao quanh Start, ép thuật toán phải đi ngược lại hướng của Goal
const mapUTrap = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 2, 0, 1, 0, 4], // Start sẽ ở [3, 3] (bên trong chữ U)
    [0, 1, 1, 1, 0, 1, 0, 0], // Lỗ hổng duy nhất ở dưới
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]  // Goal sẽ ở [3, 7] (bên ngoài, ngang hàng Start)
];


// ==========================================
// 3. KỊCH BẢN 3: ĐỊA HÌNH ĐẦM LẦY (Terrain Dilemma)
// ==========================================
const mapTerrain = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 3, 1, 1, 1, 1],
    [2, 0, 0, 0, 3, 0, 0, 0, 4], // Hướng đi thẳng tốn cost = 3 (Đầm lầy)
    [1, 1, 1, 1, 3, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0], // Hướng đi vòng xa hơn nhưng toàn đường nhựa (cost = 1)
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];
// Start: [2, 0], Goal: [2, 8]


// ==========================================
// 4. KỊCH BẢN 4: STRESS TEST 100x100
// ==========================================
// Một khoảng trống 10.000 ô là bài test tàn bạo nhất cho BFS/DFS vì nó phải quét diện rộng
const mapStressTest = generateOpenGrid(100);
// Start: [0, 0], Goal: [99, 99]





function runBenchmark() {
    console.log("🚀 Đang chạy Benchmark... Vui lòng đợi!");

    // Danh sách thuật toán hiện có (Bạn import thêm của Thành và Ngân vào đây sau)
    const algorithms = [
        { name: "BFS", fn: BFS },
          { name: "IDDFS", fn: IDDFS }

    ];

    const scenarios = [
        { name: "Cánh đồng trống (20x20)", maze: mapOpen, start: [0, 0], goal: [19, 19] },
        { name: "Bẫy chữ U", maze: mapUTrap, start: [3, 3], goal: [3, 7] },
        { name: "Đầm lầy chặn đường", maze: mapTerrain, start: [2, 0], goal: [2, 8] },
        { name: "Áp lực 100x100", maze: mapStressTest, start: [0, 0], goal: [99, 99] }
    ];

    const iterations = 50; // Số lần chạy để lấy trung bình cộng
    let finalResults = [];

    // Duyệt qua từng kịch bản
    for (let scenario of scenarios) {
        // Duyệt qua từng thuật toán
        for (let algo of algorithms) {
            let totalTime = 0;
            let cost = 0;
            let exploredCount = 0;

            // Chạy 50 lần để đo thời gian chính xác (loại bỏ độ nhiễu/lag của máy)
            for (let i = 0; i < iterations; i++) {
                // Nhớ đảm bảo các hàm BFS, IDDFS có nhận vào (maze, start, goal)
                let result = algo.fn(scenario.maze, scenario.start, scenario.goal);

                totalTime += result.time;

                // Vì cost và exploredNodes cho 1 bản đồ là cố định, ta chỉ cần lấy ở lần chạy đầu tiên
                if (i === 0) {
                    cost = result.cost;
                    exploredCount = result.exploredNodes.length;
                }
            }

            // Lưu kết quả vào mảng
            finalResults.push({
                "Kịch bản": scenario.name,
                "Thuật toán": algo.name,
                "Chi phí (Cost)": cost,
                "Số Node đã duyệt": exploredCount,
                "Thời gian TB (ms)": +(totalTime / iterations).toFixed(4) // Cắt gọn 4 số thập phân
            });
        }
    }

    // 3. IN KẾT QUẢ RA BẢNG EXCEL-LIKE TRÊN CONSOLE
    console.table(finalResults);
    console.log("✅ Hoàn thành! Bạn có thể copy bảng trên vào Excel.");
}

runBenchmark();