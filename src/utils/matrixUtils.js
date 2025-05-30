//Tính định thức bằng phương pháp đệ quy.
export function determinantMod26(matrix) {
    const n = matrix.length;
    if (n === 1) return matrix[0][0] % 26;
    
    let det = 0;
    for (let i = 0; i < n; i++) {
        const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
        det += ((i % 2 === 0 ? 1 : -1) * matrix[0][i] * determinantMod26(subMatrix)) % 26;
    }
    return (det + 26) % 26;
}

export function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return null;
}
// Tính ma trận nghịch đảo bằng ma trận phần bù đại số và chuyển vị.
export function inverseMatrixMod26(matrix) {
    const n = matrix.length;
    const det = determinantMod26(matrix);
    const detInverse = modInverse(det, 26);
    if (det === 0 || detInverse === null) return null;

    const cofactorMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const subMatrix = matrix
                .filter((_, rowIndex) => rowIndex !== i)
                .map(row => row.filter((_, colIndex) => colIndex !== j));
            
            cofactorMatrix[i][j] = ((determinantMod26(subMatrix) * ((i + j) % 2 === 0 ? 1 : -1)) + 26) % 26;
        }
    }
    
    const adjugateMatrix = transposeMatrix(cofactorMatrix);
    return adjugateMatrix.map(row => row.map(num => (num * detInverse) % 26));
}
// Chuyển vị ma trận để hỗ trợ tính adjugate.
function transposeMatrix(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

//Chuyển từ chuỗi khóa sang ma trận số
export function keyStringToMatrix(keyMatrix) {
    return keyMatrix.map(row =>
        row.map(value => {
            if (typeof value === "string") {
                if (!isNaN(value)) return parseInt(value); // Nếu là số, giữ nguyên
                const upperChar = value.toUpperCase();
                return upperChar.charCodeAt(0) - 65; // Chuyển chữ thành số (A=0, B=1, ..., Z=25)
            }
            return value;
        })
    );
}

// Hàm tạo ma trận ngẫu nhiên khả nghịch trong modulo 26
export function generateInvertibleMatrix(n) {
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error("Kích thước ma trận phải là số nguyên dương!");
    }

    const maxAttempts = 100; // Số lần thử tối đa để tạo ma trận khả nghịch
    let attempts = 0;

    while (attempts < maxAttempts) {
        // Tạo ma trận ngẫu nhiên n x n với các phần tử trong [0, 25]
        const matrix = Array.from({ length: n }, () =>
            Array.from({ length: n }, () => Math.floor(Math.random() * 26))
        );

        // Tính định thức
        const det = determinantMod26(matrix);
        
        // Kiểm tra tính khả nghịch: det phải có nghịch đảo trong modulo 26
        const detInverse = modInverse(det, 26);
        if (detInverse !== null) {
            return matrix; // Ma trận khả nghịch, trả về
        }

        attempts++;
    }

    throw new Error(`Không thể tạo ma trận khả nghịch sau ${maxAttempts} lần thử!`);
}


