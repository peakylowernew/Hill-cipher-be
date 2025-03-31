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
