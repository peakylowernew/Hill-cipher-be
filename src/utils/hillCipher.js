export function determinantMod26(matrix) {
    const n = matrix.length;
    if (n === 1) return matrix[0][0] % 26;
    
    let det = 0;
    for (let col = 0; col < n; col++) {
        let subMatrix = matrix.slice(1).map(row => row.filter((_, j) => j !== col));
        let cofactor = ((col % 2 === 0 ? 1 : -1) * matrix[0][col] * determinantMod26(subMatrix)) % 26;
        det = (det + cofactor + 26) % 26;
    }
    return det;
}

export function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return null;
}

export function inverseMatrixMod26(matrix, detInverse) {
    const n = matrix.length;
    let adjugate = Array.from({ length: n }, () => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let subMatrix = matrix.filter((_, row) => row !== i).map(row => row.filter((_, col) => col !== j));
            let cofactor = ((i + j) % 2 === 0 ? 1 : -1) * determinantMod26(subMatrix);
            adjugate[j][i] = ((cofactor * detInverse) % 26 + 26) % 26; // Transpose + mod
        }
    }
    return adjugate;
}

export function encryptText(text, keyMatrix) {
    if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
        throw new Error("Dữ liệu đầu vào không hợp lệ!");
    }

    const n = keyMatrix.length;
    if (keyMatrix.some(row => row.length !== n)) {
        throw new Error("Ma trận khóa không hợp lệ! Phải là ma trận vuông.");
    }

    let textVector = text.toUpperCase().split("").map(ch => ch.charCodeAt(0) - 65);
    while (textVector.length % n !== 0) {
        textVector.push(23);
    }

    let encryptedVector = [];
    for (let i = 0; i < textVector.length; i += n) {
        let block = textVector.slice(i, i + n);
        let encryptedBlock = new Array(n).fill(0);

        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                encryptedBlock[row] += keyMatrix[row][col] * block[col];
            }
            encryptedBlock[row] = encryptedBlock[row] % 26;
        }

        encryptedVector.push(...encryptedBlock);
    }

    return encryptedVector.map(num => String.fromCharCode(num + 65)).join("");
}

export function decryptText(text, keyMatrix) {
    try {
        const n = keyMatrix.length;
        const det = determinantMod26(keyMatrix);
        const detInverse = modInverse(det, 26);
        if (det === 0 || detInverse === null) {
            throw new Error("Ma trận khóa không khả nghịch trong modulo 26!");
        }

        const inverseMatrix = inverseMatrixMod26(keyMatrix, detInverse);
        if (!inverseMatrix) {
            throw new Error("Không thể tính nghịch đảo của ma trận!");
        }

        return hillCipherDecrypt(text, inverseMatrix);
    } catch (error) {
        console.error("Lỗi giải mã:", error);
        return null;
    }
}

export function hillCipherDecrypt(text, inverseMatrix) {
    const n = inverseMatrix.length;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    text = text.toUpperCase().replace(/[^A-Z]/g, "");

    let decryptedText = "";
    for (let i = 0; i < text.length; i += n) {
        let vector = [];
        for (let j = 0; j < n; j++) {
            vector.push(alphabet.indexOf(text[i + j] || "X"));
        }

        let resultVector = new Array(n).fill(0);
        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                resultVector[row] += inverseMatrix[row][col] * vector[col];
            }
            resultVector[row] = ((resultVector[row] % 26) + 26) % 26;
        }

        decryptedText += resultVector.map(num => alphabet[num]).join("");
    }

    return decryptedText;
}